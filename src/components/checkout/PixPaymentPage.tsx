import { Link } from "@tanstack/react-router";
import { CheckCircle2, Copy, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { getOrderById, getPaymentByOrder, type OrderResponse, type PaymentResponse } from "@/lib/api";
import { formatCurrency } from "@/lib/formatCurrency";
import { formatOrderDateTime } from "@/lib/orderFormat";
import { PixCodeSkeleton, PixPaymentSkeleton } from "./CheckoutSkeletons";

export function PixPaymentPage({ orderId }: { orderId: number }) {
  const [data, setData] = useState<{ order: OrderResponse; payment: PaymentResponse } | null>(null);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!Number.isSafeInteger(orderId) || orderId <= 0) {
      setError("Pedido inválido.");
      return;
    }
    let active = true;
    let timer: ReturnType<typeof setTimeout>;
    async function refresh() {
      let keepPolling = true;
      try {
        const [order, payment] = await Promise.all([getOrderById(orderId), getPaymentByOrder(orderId)]);
        if (!active) return;
        setData({ order, payment });
        setError("");
        keepPolling = order.status === "PENDING_PAYMENT" && !["FAILED", "CANCELED", "REFUNDED"].includes(payment.status);
      } catch {
        if (active) setError("Não foi possível atualizar o pagamento. Tentaremos novamente automaticamente.");
      }
      if (active && keepPolling) timer = setTimeout(refresh, 10000);
    }
    void refresh();
    const clock = setInterval(() => setNow(Date.now()), 1000);
    return () => { active = false; clearTimeout(timer); clearInterval(clock); };
  }, [orderId, attempt]);

  async function copyPix() {
    if (!data?.payment.pix_qr_code) return;
    try {
      await navigator.clipboard.writeText(data.payment.pix_qr_code);
      setCopied(true);
      setCopyError(false);
    } catch {
      setCopyError(true);
    }
  }

  const order = data?.order;
  const payment = data?.payment;
  const paid = order && ["PAID", "PREPARING", "SHIPPED", "READY_FOR_PICKUP", "DELIVERED"].includes(order.status);
  const expired = !!payment?.expires_at && new Date(payment.expires_at).getTime() <= now;
  const unavailable = order && (order.payment_method !== "PIX" || order.status === "CANCELED" || ["FAILED", "CANCELED", "REFUNDED"].includes(payment?.status ?? ""));

  return (
    <div className="section-canvas min-h-[70vh]">
      <div className="container-page py-10 sm:py-16">
        <div className="mx-auto max-w-2xl">
          <p className="eyebrow">Pagamento do pedido {order && `#${order.id}`}</p>
          <h1 className="editorial-title mt-3 text-3xl sm:text-4xl">{paid ? "Pagamento confirmado!" : "Pague seu pedido com Pix"}</h1>
          {error && <div role="alert" className="alert-error mt-5">{error}<button className="btn-secondary mt-3" onClick={() => setAttempt(value => value + 1)}>Tentar novamente</button></div>}
          {!data && !error && <PixPaymentSkeleton />}
          {order && payment && (
            <section className="surface-card mt-6 p-5 sm:p-8">
              {paid ? (
                <div role="status" className="text-center"><CheckCircle2 className="mx-auto h-12 w-12 text-forest" /><p className="mt-4">Recebemos seu pagamento. Você já pode acompanhar os próximos passos do pedido.</p></div>
              ) : unavailable ? (
                <p role="status">Este pedido não está disponível para pagamento por Pix. Consulte os detalhes no acompanhamento.</p>
              ) : expired ? (
                <p role="status">Este código Pix expirou. Consulte o acompanhamento do pedido para verificar a situação do pagamento.</p>
              ) : (
                <>
                  <p className="text-sm text-muted">Pedido criado! Falta apenas o pagamento para confirmar sua compra.</p>
                  <p className="mt-5 text-sm text-muted">Total a pagar</p>
                  <p className="font-display text-3xl font-bold">{formatCurrency(Number(order.valor_total))}</p>
                  {payment.pix_qr_code_base64 && <img src={`data:image/png;base64,${payment.pix_qr_code_base64}`} alt="QR Code para pagamento Pix" className="mx-auto my-6 h-60 w-60 max-w-full rounded bg-white p-3" />}
                  {payment.pix_qr_code ? (
                    <>
                      <p className="mt-5 text-sm text-muted">No aplicativo do seu banco, escolha Pix e escaneie o QR Code ou use a opção Pix copia e cola.</p>
                      <button type="button" onClick={() => void copyPix()} className="btn-primary mt-5 w-full"><Copy className="h-4 w-4" />{copied ? "Código copiado!" : "Copiar código Pix"}</button>
                      <label className="field-label mt-4" htmlFor="pix-code">Pix copia e cola</label>
                      <textarea id="pix-code" readOnly value={payment.pix_qr_code} className="field-input h-20 resize-none break-all text-xs" onFocus={event => event.target.select()} />
                      {copyError && <p role="alert" className="mt-2 text-sm text-danger">Não foi possível copiar. Selecione e copie o código acima.</p>}
                    </>
                  ) : <><PixCodeSkeleton /><p className="mt-5 text-sm text-muted">Aguardando o código Pix. Esta página será atualizada automaticamente.</p></>}
                  {payment.expires_at && <p className="mt-4 text-sm text-muted">Válido até {formatOrderDateTime(payment.expires_at)}.</p>}
                  <p role="status" className="mt-5 flex items-center gap-2 text-sm text-muted"><Loader2 className="h-4 w-4 animate-spin" />Aguardando pagamento. A confirmação aparecerá aqui automaticamente.</p>
                </>
              )}
            </section>
          )}
          {order && <Link to="/pedido/$orderId" params={{ orderId: String(order.id) }} className="btn-secondary mt-6">Acompanhar pedido</Link>}
        </div>
      </div>
    </div>
  );
}
