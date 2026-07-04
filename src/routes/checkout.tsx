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
import { ApiError, createOrder, getAuthMe, quoteShipping } from "@/lib/api";
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

const inputClassName =
  "w-full rounded-xl border border-neutral-300 px-4 py-2.5 text-sm outline-none transition-colors focus:border-[var(--color-brand-green)] focus:ring-2 focus:ring-[var(--color-brand-green)]/20";

const readOnlyClassName =
  "w-full rounded-xl border border-neutral-300 bg-neutral-50 px-4 py-2.5 text-sm outline-none";

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

  const orderTotal = useMemo(() => cartTotal + shippingCost, [cartTotal, shippingCost]);

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
        items: items.map((item) => ({
          product_id: item.productId,
          name: item.nome,
          image_url: item.imagem_url,
          size: item.tamanho,
          quantity: item.quantidade,
          unit_price: item.preco,
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
          <section className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-soft">
            <p className="mb-5 text-sm text-neutral-600">
              Seus dados foram preenchidos automaticamente com sua conta.
            </p>
            {loadingProfile && (
              <p className="mb-4 text-sm text-neutral-500">Carregando seus dados...</p>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="customerName" className="mb-1.5 block text-sm font-medium text-neutral-700">
                  Nome completo
                </label>
                <input
                  id="customerName"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  readOnly={loadingProfile}
                  className={readOnlyClassName}
                />
              </div>
              <div>
                <label htmlFor="customerEmail" className="mb-1.5 block text-sm font-medium text-neutral-700">
                  E-mail
                </label>
                <input
                  id="customerEmail"
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  readOnly={loadingProfile}
                  className={readOnlyClassName}
                />
              </div>
              <div>
                <label htmlFor="customerPhone" className="mb-1.5 block text-sm font-medium text-neutral-700">
                  Telefone / WhatsApp
                </label>
                <input
                  id="customerPhone"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(formatPhone(e.target.value))}
                  className={inputClassName}
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="customerCpf" className="mb-1.5 block text-sm font-medium text-neutral-700">
                  CPF
                </label>
                <input
                  id="customerCpf"
                  value={customerCpf}
                  onChange={(e) => setCustomerCpf(formatCpf(e.target.value))}
                  className={inputClassName}
                />
              </div>
            </div>
          </section>
        );

      case 2:
        return (
          <section className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-soft">
            <p className="mb-5 text-sm text-neutral-600">
              Digite o CEP para preencher rua, bairro, cidade e estado automaticamente.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="cep" className="mb-1.5 block text-sm font-medium text-neutral-700">
                  CEP
                </label>
                <div className="relative">
                  <input
                    id="cep"
                    value={cep}
                    onChange={(e) => handleCepChange(e.target.value)}
                    placeholder="00000-000"
                    className={inputClassName}
                  />
                  {loadingCep && (
                    <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-neutral-400" />
                  )}
                </div>
                {cepError && <p className="mt-1 text-xs text-red-600">{cepError}</p>}
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="street" className="mb-1.5 block text-sm font-medium text-neutral-700">
                  Rua
                </label>
                <input id="street" value={street} onChange={(e) => setStreet(e.target.value)} className={inputClassName} />
              </div>
              <div>
                <label htmlFor="number" className="mb-1.5 block text-sm font-medium text-neutral-700">
                  Número
                </label>
                <input id="number" value={number} onChange={(e) => setNumber(e.target.value)} className={inputClassName} />
              </div>
              <div>
                <label htmlFor="complement" className="mb-1.5 block text-sm font-medium text-neutral-700">
                  Complemento
                </label>
                <input
                  id="complement"
                  value={complement}
                  onChange={(e) => setComplement(e.target.value)}
                  className={inputClassName}
                />
              </div>
              <div>
                <label htmlFor="neighborhood" className="mb-1.5 block text-sm font-medium text-neutral-700">
                  Bairro
                </label>
                <input
                  id="neighborhood"
                  value={neighborhood}
                  onChange={(e) => setNeighborhood(e.target.value)}
                  className={inputClassName}
                />
              </div>
              <div>
                <label htmlFor="city" className="mb-1.5 block text-sm font-medium text-neutral-700">
                  Cidade
                </label>
                <input id="city" value={city} onChange={(e) => setCity(e.target.value)} className={inputClassName} />
              </div>
              <div>
                <label htmlFor="state" className="mb-1.5 block text-sm font-medium text-neutral-700">
                  Estado
                </label>
                <select
                  id="state"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className={inputClassName}
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
          <section className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-soft">
            <p className="mb-5 text-sm text-neutral-600">
              Escolha como deseja receber seus produtos.
            </p>
            <div className="space-y-3">
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-neutral-200 p-4 transition-colors has-checked:border-[var(--color-brand-green)] has-checked:bg-[var(--color-brand-green)]/5">
                <input
                  type="radio"
                  name="shippingMethod"
                  value="ENTREGA"
                  checked={shippingMethod === "ENTREGA"}
                  onChange={() => setShippingMethod("ENTREGA")}
                  className="mt-1"
                />
                <span className="flex-1">
                  <span className="flex items-center justify-between gap-3">
                    <span className="block text-sm font-semibold text-neutral-900">Entrega</span>
                    <span className="text-sm font-semibold text-[var(--color-brand-green)]">
                      {loadingShipping ? "Calculando..." : shippingCost > 0 ? formatCurrency(shippingCost) : "—"}
                    </span>
                  </span>
                  <span className="mt-1 block text-sm text-neutral-600">
                    Frete calculado com base no CEP e quantidade de itens.
                  </span>
                  {!loadingShipping && shippingCost > 0 && (
                    <span className="mt-1 block text-xs text-neutral-500">{shippingLabel}</span>
                  )}
                </span>
              </label>

              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-neutral-200 p-4 transition-colors has-checked:border-[var(--color-brand-green)] has-checked:bg-[var(--color-brand-green)]/5">
                <input
                  type="radio"
                  name="shippingMethod"
                  value="RETIRADA"
                  checked={shippingMethod === "RETIRADA"}
                  onChange={() => setShippingMethod("RETIRADA")}
                  className="mt-1"
                />
                <span className="flex-1">
                  <span className="flex items-center justify-between gap-3">
                    <span className="block text-sm font-semibold text-neutral-900">
                      Retirada / combinar com a loja
                    </span>
                    <span className="text-sm font-semibold text-[var(--color-brand-green)]">Grátis</span>
                  </span>
                  <span className="mt-1 block text-sm text-neutral-600">
                    Combine diretamente conosco a retirada ou entrega local.
                  </span>
                </span>
              </label>
            </div>
          </section>
        );

      case 4:
        return (
          <section className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-soft">
            <p className="mb-5 text-sm text-neutral-600">
              Selecione como deseja pagar seu pedido.
            </p>
            <div className="space-y-3">
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-neutral-200 p-4 transition-colors has-checked:border-[var(--color-brand-green)] has-checked:bg-[var(--color-brand-green)]/5">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="PIX"
                  checked={paymentMethod === "PIX"}
                  onChange={() => setPaymentMethod("PIX")}
                  className="mt-1"
                />
                <span>
                  <span className="block text-sm font-semibold text-neutral-900">Pix</span>
                  <span className="mt-1 block text-sm text-neutral-600">
                    Você receberá as instruções de pagamento após criar o pedido.
                  </span>
                </span>
              </label>

              <label className="flex cursor-not-allowed items-start gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-4 opacity-70">
                <input type="radio" name="paymentMethod" value="CARTAO" disabled className="mt-1" />
                <span>
                  <span className="block text-sm font-semibold text-neutral-900">Cartão de crédito</span>
                  <span className="mt-1 block text-sm text-neutral-600">Em breve</span>
                </span>
              </label>
            </div>
          </section>
        );

      case 5:
        return (
          <section className="space-y-4">
            <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-soft">
              <h3 className="font-display text-lg font-bold text-neutral-900">Dados do cliente</h3>
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-neutral-500">Nome</dt>
                  <dd className="text-right font-medium text-neutral-900">{customerName}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-neutral-500">E-mail</dt>
                  <dd className="text-right font-medium text-neutral-900">{customerEmail}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-neutral-500">Telefone</dt>
                  <dd className="text-right font-medium text-neutral-900">{customerPhone}</dd>
                </div>
                {customerCpf && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-neutral-500">CPF</dt>
                    <dd className="text-right font-medium text-neutral-900">{customerCpf}</dd>
                  </div>
                )}
              </dl>
            </div>

            <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-soft">
              <h3 className="font-display text-lg font-bold text-neutral-900">Endereço de entrega</h3>
              <p className="mt-4 text-sm text-neutral-700">
                {street}, {number}
                {complement ? ` — ${complement}` : ""}
                <br />
                {neighborhood} — {city}/{state}
                <br />
                CEP {formatCep(cep)}
              </p>
            </div>

            <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-soft">
              <h3 className="font-display text-lg font-bold text-neutral-900">Entrega e pagamento</h3>
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-neutral-500">Entrega</dt>
                  <dd className="text-right font-medium text-neutral-900">
                    {shippingMethod === "RETIRADA" ? "Retirada/combinar com a loja" : shippingLabel}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-neutral-500">Frete</dt>
                  <dd className="text-right font-medium text-neutral-900">
                    {shippingMethod === "RETIRADA" ? "Grátis" : formatCurrency(shippingCost)}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-neutral-500">Pagamento</dt>
                  <dd className="text-right font-medium text-neutral-900">Pix</dd>
                </div>
              </dl>
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
        <Loader2 className="h-8 w-8 animate-spin text-[var(--color-brand-green)]" />
      </div>
    );
  }

  const isLastStep = currentStep === CHECKOUT_STEPS.length;
  const isFirstStep = currentStep === 1;

  return (
    <div className="container-page py-12 lg:py-16">
      <div className="mb-2">
        <h1 className="font-display text-3xl font-bold text-neutral-900">Checkout</h1>
        <p className="mt-2 text-neutral-600">
          Finalize seu pedido em etapas simples e rápidas.
        </p>
      </div>

      <CheckoutStepper steps={CHECKOUT_STEPS} currentStep={currentStep} />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div>
          {error && (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {renderStepContent()}

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            {!isFirstStep ? (
              <button
                type="button"
                onClick={goToPreviousStep}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-neutral-300 px-6 py-3 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-50"
              >
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
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--color-brand-green)] px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 sm:ml-auto"
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
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--color-brand-green)] px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 sm:ml-auto"
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
        />
      </div>
    </div>
  );
}
