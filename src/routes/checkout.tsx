import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CreditCard,
  Loader2,
  MapPin,
  Package,
  User,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckoutOrderSummary } from "@/components/checkout/CheckoutOrderSummary";
import { CheckoutStepper, type CheckoutStepDefinition } from "@/components/checkout/CheckoutStepper";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { ApiError, createOrder, getAuthMe, quoteShipping, validateCoupon } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { fetchAddressByCep } from "@/lib/cep";
import { formatCurrency } from "@/lib/formatCurrency";
import { saveOrderConfirmation } from "@/lib/orderStorage";
import { isTokenExpired } from "@/utils/authToken";
import {
  formatCep,
  formatCpf,
  formatPhone,
  isValidCpf,
  isValidEmail,
  onlyDigits,
} from "@/lib/validators";

export const Route = createFileRoute("/checkout")({
  component: CheckoutPage,
});

const BRAZILIAN_STATES = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
  "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
  "RS", "RO", "RR", "SC", "SP", "SE", "TO",
];

const CHECKOUT_STEPS: CheckoutStepDefinition[] = [
  { id: 1, label: "Dados do cliente", shortLabel: "Cliente", icon: User },
  { id: 2, label: "Endereço de entrega", shortLabel: "Endereço", icon: MapPin },
  { id: 3, label: "Entrega ou retirada", shortLabel: "Entrega", icon: Package },
  { id: 4, label: "Método de pagamento", shortLabel: "Pagamento", icon: CreditCard },
  { id: 5, label: "Revisão do pedido", shortLabel: "Revisão", icon: CheckCircle2 },
];

type ShippingMethod = "ENTREGA" | "RETIRADA";
type PaymentMethod = "PIX" | "CARTAO";

const selectableCardClass =
  "flex cursor-pointer items-start gap-3 rounded border border-line p-4 transition-colors has-checked:border-forest has-checked:bg-[color-mix(in_srgb,var(--color-lime)_18%,white)]";

function CheckoutPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { items, itemCount, cartTotal, clearCart } = useCart();

  const [currentStep, setCurrentStep] = useState(1);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerCpf, setCustomerCpf] = useState("");
  const [cep, setCep] = useState("");
  const [street, setStreet] = useState("");
  const [number, setNumber] = useState("");
  const [complement, setComplement] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("SP");
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>("ENTREGA");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("PIX");
  const [shippingCost, setShippingCost] = useState(0);
  const [shippingLabel, setShippingLabel] = useState("Informe o CEP para calcular");
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingCep, setLoadingCep] = useState(false);
  const [loadingShipping, setLoadingShipping] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [cepError, setCepError] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [couponPercent, setCouponPercent] = useState(0);
  const [couponMessage, setCouponMessage] = useState("");
  const [loadingCoupon, setLoadingCoupon] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token || isTokenExpired(token) || !isAuthenticated) {
      navigate({ to: "/login", search: { redirect: "/checkout" } });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (items.length === 0) {
      navigate({ to: "/carrinho" });
    }
  }, [items.length, navigate]);

  const refreshShippingQuote = useCallback(async () => {
    if (shippingMethod === "RETIRADA") {
      setShippingCost(0);
      setShippingLabel("Retirada/combinar com a loja");
      return;
    }

    const cepDigits = onlyDigits(cep);
    if (cepDigits.length !== 8) {
      setShippingCost(0);
      setShippingLabel("Informe o CEP para calcular");
      return;
    }

    setLoadingShipping(true);
    try {
      const quote = await quoteShipping({
        cep: formatCep(cep),
        shipping_method: shippingMethod,
        item_count: itemCount,
      });
      setShippingCost(Number(quote.frete));
      setShippingLabel(quote.label);
    } catch {
      setShippingCost(0);
      setShippingLabel("Não foi possível calcular o frete");
    } finally {
      setLoadingShipping(false);
    }
  }, [cep, itemCount, shippingMethod]);

  useEffect(() => {
    if (!isAuthenticated) return;

    setLoadingProfile(true);
    getAuthMe()
      .then((profile) => {
        setCustomerName(profile.nome);
        setCustomerEmail(profile.email);
        if (profile.telefone) setCustomerPhone(formatPhone(profile.telefone));
        if (profile.cpf) setCustomerCpf(formatCpf(profile.cpf));

        if (profile.endereco) {
          setCep(formatCep(profile.endereco.cep));
          setStreet(profile.endereco.rua);
          setNumber(profile.endereco.numero);
          setNeighborhood(profile.endereco.bairro);
          setCity(profile.endereco.cidade);
          setState(profile.endereco.estado);
        }
      })
      .catch(() => {
        setError("Não foi possível carregar seus dados. Tente novamente.");
      })
      .finally(() => setLoadingProfile(false));
  }, [isAuthenticated]);

  useEffect(() => {
    if (currentStep >= 3) {
      refreshShippingQuote();
    }
  }, [currentStep, refreshShippingQuote]);

  const couponDiscount = useMemo(
    () => Math.round(cartTotal * couponPercent) / 100,
    [cartTotal, couponPercent],
  );
  const orderTotal = useMemo(
    () => Math.max(0, cartTotal - couponDiscount) + shippingCost,
    [cartTotal, couponDiscount, shippingCost],
  );

  async function handleApplyCoupon() {
    const code = couponCode.trim().toUpperCase();
    if (!code) return;
    setLoadingCoupon(true);
    setCouponMessage("");
    try {
      const coupon = await validateCoupon(code);
      setCouponCode(coupon.codigo);
      setCouponPercent(Number(coupon.desconto));
      setCouponMessage(`Cupom aplicado: ${coupon.desconto}% de desconto.`);
    } catch (err) {
      setCouponPercent(0);
      setCouponMessage(err instanceof ApiError ? err.message : "Cupom inválido.");
    } finally {
      setLoadingCoupon(false);
    }
  }

  async function handleCepChange(value: string) {
    const formatted = formatCep(value);
    setCep(formatted);
    setCepError("");

    if (onlyDigits(formatted).length !== 8) return;

    setLoadingCep(true);
    try {
      const address = await fetchAddressByCep(formatted);
      if (!address) {
        setCepError("CEP não encontrado.");
        return;
      }

      setStreet(address.logradouro || "");
      setNeighborhood(address.bairro || "");
      setCity(address.localidade || "");
      setState(address.uf || state);
      if (address.complemento && !complement) {
        setComplement(address.complemento);
      }
    } catch {
      setCepError("Não foi possível buscar o CEP.");
    } finally {
      setLoadingCep(false);
    }
  }

  function validateStep(step: number): string | null {
    switch (step) {
      case 1:
        if (loadingProfile) return "Aguarde o carregamento dos seus dados.";
        if (!customerName.trim()) return "Informe seu nome completo.";
        if (!customerEmail.trim()) return "Informe seu e-mail.";
        if (!isValidEmail(customerEmail)) return "Informe um e-mail válido.";
        if (onlyDigits(customerPhone).length < 10) return "Informe um telefone válido.";
        if (customerCpf.trim() && !isValidCpf(customerCpf)) return "Informe um CPF válido.";
        return null;
      case 2:
        if (onlyDigits(cep).length !== 8) return "Informe um CEP válido.";
        if (!street.trim()) return "Informe a rua.";
        if (!number.trim()) return "Informe o número.";
        if (!neighborhood.trim()) return "Informe o bairro.";
        if (!city.trim()) return "Informe a cidade.";
        if (!state.trim()) return "Informe o estado.";
        return null;
      case 3:
        if (shippingMethod === "ENTREGA" && (loadingShipping || shippingCost <= 0)) {
          return "Aguarde o cálculo do frete ou informe um CEP válido.";
        }
        return null;
      case 4:
        if (!paymentMethod) return "Selecione um método de pagamento.";
        return null;
      case 5:
        if (items.length === 0) return "Seu carrinho está vazio.";
        return validateStep(1) ?? validateStep(2) ?? validateStep(3) ?? validateStep(4);
      default:
        return null;
    }
  }

  function goToNextStep() {
    setError("");
    const validationError = validateStep(currentStep);
    if (validationError) {
      setError(validationError);
      return;
    }
    setCurrentStep((step) => Math.min(step + 1, CHECKOUT_STEPS.length));
  }

  function goToPreviousStep() {
    setError("");
    setCurrentStep((step) => Math.max(step - 1, 1));
  }

  async function handleCreateOrder() {
    setError("");
    const validationError = validateStep(5);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    try {
      const order = await createOrder({
        customer_name: customerName.trim(),
        customer_email: customerEmail.trim(),
        customer_phone: onlyDigits(customerPhone),
        customer_cpf: customerCpf.trim() ? onlyDigits(customerCpf) : undefined,
        shipping_address: {
          cep: formatCep(cep),
          street: street.trim(),
          number: number.trim(),
          complement: complement.trim() || undefined,
          neighborhood: neighborhood.trim(),
          city: city.trim(),
          state: state.trim().toUpperCase(),
        },
        shipping_method: shippingMethod,
        payment_method: paymentMethod,
        frete: shippingCost,
        coupon_code: couponPercent > 0 ? couponCode : undefined,
        items: items.map((item) => ({
          product_id: item.productId,
          quantity: item.quantidade,
        })),
      });

      saveOrderConfirmation(order);
      clearCart();
      await navigate({ to: "/pedido/$orderId", params: { orderId: String(order.id) } });
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Não foi possível criar o pedido.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  function renderStepContent() {
    switch (currentStep) {
      case 1:
        return (
          <section className="surface-card p-5 sm:p-6">
            <p className="mb-5 text-sm text-muted">
              Seus dados foram preenchidos automaticamente com sua conta.
            </p>
            {loadingProfile && (
              <p className="mb-4 text-sm text-muted">Carregando seus dados...</p>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="customerName" className="field-label">
                  Nome completo
                </label>
                <input
                  id="customerName"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  readOnly={loadingProfile}
                  className="field-input"
                />
              </div>
              <div>
                <label htmlFor="customerEmail" className="field-label">
                  E-mail
                </label>
                <input
                  id="customerEmail"
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  readOnly={loadingProfile}
                  className="field-input"
                />
              </div>
              <div>
                <label htmlFor="customerPhone" className="field-label">
                  Telefone / WhatsApp
                </label>
                <input
                  id="customerPhone"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(formatPhone(e.target.value))}
                  className="field-input"
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="customerCpf" className="field-label">
                  CPF
                </label>
                <input
                  id="customerCpf"
                  value={customerCpf}
                  onChange={(e) => setCustomerCpf(formatCpf(e.target.value))}
                  className="field-input"
                />
              </div>
            </div>
          </section>
        );

      case 2:
        return (
          <section className="surface-card p-5 sm:p-6">
            <p className="mb-5 text-sm text-muted">
              Digite o CEP para preencher rua, bairro, cidade e estado automaticamente.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="cep" className="field-label">
                  CEP
                </label>
                <div className="relative">
                  <input
                    id="cep"
                    value={cep}
                    onChange={(e) => handleCepChange(e.target.value)}
                    placeholder="00000-000"
                    className="field-input"
                  />
                  {loadingCep && (
                    <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted" />
                  )}
                </div>
                {cepError && <p className="mt-1.5 text-xs text-danger">{cepError}</p>}
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="street" className="field-label">
                  Rua
                </label>
                <input
                  id="street"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className="field-input"
                />
              </div>
              <div>
                <label htmlFor="number" className="field-label">
                  Número
                </label>
                <input
                  id="number"
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                  className="field-input"
                />
              </div>
              <div>
                <label htmlFor="complement" className="field-label">
                  Complemento
                </label>
                <input
                  id="complement"
                  value={complement}
                  onChange={(e) => setComplement(e.target.value)}
                  className="field-input"
                />
              </div>
              <div>
                <label htmlFor="neighborhood" className="field-label">
                  Bairro
                </label>
                <input
                  id="neighborhood"
                  value={neighborhood}
                  onChange={(e) => setNeighborhood(e.target.value)}
                  className="field-input"
                />
              </div>
              <div>
                <label htmlFor="city" className="field-label">
                  Cidade
                </label>
                <input
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="field-input"
                />
              </div>
              <div>
                <label htmlFor="state" className="field-label">
                  Estado
                </label>
                <select
                  id="state"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="field-input"
                >
                  {BRAZILIAN_STATES.map((uf) => (
                    <option key={uf} value={uf}>
                      {uf}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>
        );

      case 3:
        return (
          <section className="surface-card p-5 sm:p-6">
            <p className="mb-5 text-sm text-muted">
              Escolha como deseja receber seus produtos.
            </p>
            <div className="space-y-3">
              <label className={selectableCardClass}>
                <input
                  type="radio"
                  name="shippingMethod"
                  value="ENTREGA"
                  checked={shippingMethod === "ENTREGA"}
                  onChange={() => setShippingMethod("ENTREGA")}
                  className="mt-1 accent-forest"
                />
                <span className="flex-1">
                  <span className="flex items-center justify-between gap-3">
                    <span className="block text-sm font-semibold text-ink">Entrega</span>
                    <span className="text-sm font-semibold text-forest">
                      {loadingShipping
                        ? "Calculando..."
                        : shippingCost > 0
                          ? formatCurrency(shippingCost)
                          : "—"}
                    </span>
                  </span>
                  <span className="mt-1 block text-sm text-muted">
                    Frete calculado com base no CEP e quantidade de itens.
                  </span>
                  {!loadingShipping && shippingCost > 0 && (
                    <span className="mt-1 block text-xs text-muted">{shippingLabel}</span>
                  )}
                </span>
              </label>

              <label className={selectableCardClass}>
                <input
                  type="radio"
                  name="shippingMethod"
                  value="RETIRADA"
                  checked={shippingMethod === "RETIRADA"}
                  onChange={() => setShippingMethod("RETIRADA")}
                  className="mt-1 accent-forest"
                />
                <span className="flex-1">
                  <span className="flex items-center justify-between gap-3">
                    <span className="block text-sm font-semibold text-ink">
                      Retirada / combinar com a loja
                    </span>
                    <span className="text-sm font-semibold text-forest">Grátis</span>
                  </span>
                  <span className="mt-1 block text-sm text-muted">
                    Combine diretamente conosco a retirada ou entrega local.
                  </span>
                </span>
              </label>
            </div>
          </section>
        );

      case 4:
        return (
          <section className="surface-card p-5 sm:p-6">
            <p className="mb-5 text-sm text-muted">
              Selecione como deseja pagar seu pedido.
            </p>
            <div className="space-y-3">
              <label className={selectableCardClass}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="PIX"
                  checked={paymentMethod === "PIX"}
                  onChange={() => setPaymentMethod("PIX")}
                  className="mt-1 accent-forest"
                />
                <span>
                  <span className="block text-sm font-semibold text-ink">Pix</span>
                  <span className="mt-1 block text-sm text-muted">
                    Você receberá as instruções de pagamento após criar o pedido.
                  </span>
                </span>
              </label>

              <label className="flex cursor-not-allowed items-start gap-3 rounded border border-line bg-cream/50 p-4 opacity-60">
                <input type="radio" name="paymentMethod" value="CARTAO" disabled className="mt-1" />
                <span>
                  <span className="block text-sm font-semibold text-ink">Cartão de crédito</span>
                  <span className="mt-1 block text-sm text-muted">Em breve</span>
                </span>
              </label>
            </div>
          </section>
        );

      case 5:
        return (
          <section className="space-y-3">
            <div className="surface-card p-5 sm:p-6">
              <h3 className="font-display text-base font-bold text-ink">Dados do cliente</h3>
              <dl className="mt-4 space-y-2.5 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">Nome</dt>
                  <dd className="text-right font-medium text-ink">{customerName}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">E-mail</dt>
                  <dd className="text-right font-medium text-ink">{customerEmail}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">Telefone</dt>
                  <dd className="text-right font-medium text-ink">{customerPhone}</dd>
                </div>
                {customerCpf && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted">CPF</dt>
                    <dd className="text-right font-medium text-ink">{customerCpf}</dd>
                  </div>
                )}
              </dl>
            </div>

            <div className="surface-card p-5 sm:p-6">
              <h3 className="font-display text-base font-bold text-ink">Endereço de entrega</h3>
              <p className="mt-4 text-sm leading-relaxed text-ink">
                {street}, {number}
                {complement ? ` — ${complement}` : ""}
                <br />
                {neighborhood} — {city}/{state}
                <br />
                CEP {formatCep(cep)}
              </p>
            </div>

            <div className="surface-card p-5 sm:p-6">
              <h3 className="font-display text-base font-bold text-ink">Entrega e pagamento</h3>
              <dl className="mt-4 space-y-2.5 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">Entrega</dt>
                  <dd className="text-right font-medium text-ink">
                    {shippingMethod === "RETIRADA" ? "Retirada/combinar com a loja" : shippingLabel}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">Frete</dt>
                  <dd className="text-right font-medium text-ink">
                    {shippingMethod === "RETIRADA" ? "Grátis" : formatCurrency(shippingCost)}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">Pagamento</dt>
                  <dd className="text-right font-medium text-ink">Pix</dd>
                </div>
              </dl>
            </div>

            <div className="surface-card p-5 sm:p-6">
              <h3 className="font-display text-base font-bold text-ink">Cupom de desconto</h3>
              <div className="mt-4 flex gap-2">
                <input
                  value={couponCode}
                  onChange={(event) => setCouponCode(event.target.value.toUpperCase())}
                  placeholder="DIGITE O CUPOM"
                  className="field-input flex-1 uppercase"
                />
                <button type="button" onClick={handleApplyCoupon} disabled={loadingCoupon} className="btn-secondary">
                  {loadingCoupon ? "Validando..." : "Aplicar"}
                </button>
              </div>
              {couponMessage && <p className="mt-2 text-sm text-muted">{couponMessage}</p>}
            </div>
          </section>
        );

      default:
        return null;
    }
  }

  if (!isAuthenticated || items.length === 0) {
    return (
      <div className="container-page flex min-h-[40vh] items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-forest" />
      </div>
    );
  }

  const isLastStep = currentStep === CHECKOUT_STEPS.length;
  const isFirstStep = currentStep === 1;

  return (
    <div className="container-page py-12 lg:py-16">
      <div className="mb-6">
        <p className="eyebrow mb-2">Pedido</p>
        <h1 className="editorial-title text-3xl sm:text-4xl">Checkout</h1>
        <p className="mt-2 max-w-xl text-sm text-muted">
          Finalize seu pedido em etapas simples e rápidas.
        </p>
      </div>

      <CheckoutStepper steps={CHECKOUT_STEPS} currentStep={currentStep} />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
        <div>
          {error && <div className="alert-error mb-5">{error}</div>}

          {renderStepContent()}

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            {!isFirstStep ? (
              <button type="button" onClick={goToPreviousStep} className="btn-secondary">
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </button>
            ) : (
              <span className="hidden sm:block" />
            )}

            {isLastStep ? (
              <button
                type="button"
                onClick={handleCreateOrder}
                disabled={submitting || loadingProfile || loadingShipping}
                className="btn-primary sm:ml-auto"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Criando pedido...
                  </>
                ) : (
                  <>
                    Criar pedido
                    <CheckCircle2 className="h-4 w-4" />
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={goToNextStep}
                disabled={loadingProfile || (currentStep === 3 && loadingShipping)}
                className="btn-primary sm:ml-auto"
              >
                Continuar
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        <CheckoutOrderSummary
          items={items}
          itemCount={itemCount}
          cartTotal={cartTotal}
          shippingCost={shippingCost}
          shippingMethod={shippingMethod}
          shippingLabel={shippingLabel}
          loadingShipping={loadingShipping && currentStep >= 3}
          orderTotal={orderTotal}
          couponDiscount={couponDiscount}
        />
      </div>
    </div>
  );
}
