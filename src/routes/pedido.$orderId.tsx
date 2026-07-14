import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Copy, Loader2, Shirt } from "lucide-react";
import { useEffect, useState } from "react";
import { ApiError, getOrderById, type OrderResponse } from "@/lib/api";
import { formatCurrency } from "@/lib/formatCurrency";
import { getOrderConfirmation } from "@/lib/orderStorage";

export const Route = createFileRoute("/pedido/$orderId")({
  component: PedidoConfirmacaoPage,
});

const PIX_CONTACT = "(19) 99846-0550";

function formatOrderDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatShippingMethod(method: string | null) {
  if (method === "RETIRADA") return "Retirada/combinar com a loja";
  if (method === "ENTREGA") return "Entrega";
  if (method === "FRETE_A_COMBINAR") return "Entrega";
  return "A combinar";
}

function formatStatus(status: string) {
  const labels: Record<string, string> = {
    PENDING_PAYMENT: "Aguardando pagamento",
    PAID: "Pago",
    PREPARING: "Em preparação",
    SHIPPED: "Enviado",
    DELIVERED: "Entregue",
    CANCELED: "Cancelado",
  };
  return labels[status] ?? status;
}

function PedidoConfirmacaoPage() {
  const { orderId } = Route.useParams();
  const numericOrderId = Number(orderId);
  const [order, setOrder] = useState<OrderResponse | null>(() =>
    Number.isFinite(numericOrderId) ? getOrderConfirmation(numericOrderId) : null,
  );
  const [loading, setLoading] = useState(!order);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!Number.isFinite(numericOrderId)) {
      setError("Pedido inválido.");
      setLoading(false);
      return;
    }

    if (order) {
      setLoading(false);
      return;
    }

    getOrderById(numericOrderId)
      .then(setOrder)
      .catch((err) => {
        const message =
          err instanceof ApiError ? err.message : "Não foi possível carregar o pedido.";
        setError(message);
      })
      .finally(() => setLoading(false));
  }, [numericOrderId, order]);

  async function handleCopyOrderId() {
    if (!order) return;
    await navigator.clipboard.writeText(String(order.id));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  if (loading) {
    return (
      <div className="section-canvas flex min-h-[50vh] items-center justify-center py-16">
        <div className="flex flex-col items-center gap-3 text-[var(--color-muted)]">
          <Loader2 className="h-6 w-6 animate-spin text-[var(--color-forest)]" />
          <p className="text-sm font-medium">Carregando pedido…</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="section-canvas min-h-[70vh]">
        <div className="container-page py-12 lg:py-16">
          <div className="surface-card mx-auto max-w-lg px-6 py-16 text-center">
            <h1 className="editorial-title text-3xl">Pedido não encontrado</h1>
            <p className="mt-4 text-[var(--color-muted)]">
              {error || "Não foi possível localizar este pedido."}
            </p>
            <Link to="/catalogo" className="btn-primary mt-8 inline-flex">
              Ver catálogo
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isPix = order.payment_method === "PIX";

  return (
    <div className="section-canvas min-h-[70vh]">
      <div className="container-page py-12 lg:py-16">
        <div className="mx-auto max-w-3xl">
          <div className="mb-10 text-center">
            <p className="eyebrow justify-center">
              <CheckCircle2 className="h-3.5 w-3.5 text-[var(--color-forest)]" />
              Confirmação
            </p>
            <h1 className="editorial-title mt-3 text-3xl sm:text-4xl">
              Pedido criado com <span className="editorial-serif">sucesso</span>
            </h1>
            <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-[var(--color-muted)] sm:text-base">
              Seu pedido #{order.id} foi registrado em {formatOrderDate(order.data_pedido)}.
            </p>
          </div>

          <div className="space-y-5">
            <section className="surface-card p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="field-label mb-0">Número do pedido</p>
                  <p className="editorial-title text-2xl">#{order.id}</p>
                </div>
                <button type="button" onClick={handleCopyOrderId} className="btn-secondary">
                  <Copy className="h-4 w-4" />
                  {copied ? "Copiado!" : "Copiar número"}
                </button>
              </div>

              <dl className="mt-6 grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-sm text-[var(--color-muted)]">Status</dt>
                  <dd className="mt-1 text-sm font-semibold text-[var(--color-ink)]">
                    {formatStatus(order.status)}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-[var(--color-muted)]">Pagamento</dt>
                  <dd className="mt-1 text-sm font-semibold text-[var(--color-ink)]">
                    {order.payment_method === "PIX" ? "Pix" : order.payment_method}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-[var(--color-muted)]">Entrega</dt>
                  <dd className="mt-1 text-sm font-semibold text-[var(--color-ink)]">
                    {formatShippingMethod(order.shipping_method)}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-[var(--color-muted)]">Total</dt>
                  <dd className="mt-1 font-display text-lg font-bold text-[var(--color-forest)]">
                    {formatCurrency(Number(order.valor_total))}
                  </dd>
                </div>
              </dl>
            </section>

            {isPix && (
              <section className="overflow-hidden rounded-[4px] border border-[var(--color-forest)]/20 bg-[var(--color-cream)] p-6">
                <p className="eyebrow">Pagamento</p>
                <h2 className="editorial-title mt-2 text-xl">Instruções via Pix</h2>
                <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-[var(--color-ink)]">
                  <li>
                    Entre em contato pelo WhatsApp{" "}
                    <span className="font-semibold">{PIX_CONTACT}</span> informando o número do
                    pedido <span className="font-semibold">#{order.id}</span>.
                  </li>
                  <li>Nossa equipe enviará a chave Pix e confirmará o valor total do pedido.</li>
                  <li>
                    Após o pagamento, seu pedido será atualizado para o status{" "}
                    <span className="font-semibold">Pago</span> e iniciaremos a preparação.
                  </li>
                </ol>
                <p className="mt-4 text-sm text-[var(--color-muted)]">
                  Valor do pedido:{" "}
                  <span className="font-semibold text-[var(--color-ink)]">
                    {formatCurrency(Number(order.valor_total))}
                  </span>
                </p>
              </section>
            )}

            <section className="surface-card p-6">
              <h2 className="editorial-title text-xl">Itens do pedido</h2>
              <ul className="mt-5 space-y-4">
                {order.itens.map((item) => (
                  <li
                    key={item.id}
                    className="flex gap-4 border-b border-[var(--color-line)] pb-4 last:border-b-0 last:pb-0"
                  >
                    <div className="h-20 w-16 shrink-0 overflow-hidden rounded-[4px] bg-[var(--color-cream)]">
                      {item.imagem_url ? (
                        <img
                          src={item.imagem_url}
                          alt={item.nome_produto ?? "Produto"}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[var(--color-muted)]">
                          <Shirt className="h-6 w-6" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-[var(--color-ink)]">
                        {item.nome_produto ?? `Produto #${item.product_id}`}
                      </p>
                      <p className="text-sm text-[var(--color-muted)]">
                        {item.quantidade}x • Tam. {item.tamanho ?? "-"}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-[var(--color-ink)]">
                        {formatCurrency(Number(item.subtotal))}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            <section className="surface-card p-6">
              <h2 className="editorial-title text-xl">Entrega</h2>
              <p className="mt-3 text-sm leading-relaxed text-[var(--color-ink)]">
                {order.shipping_street}, {order.shipping_number}
                {order.shipping_complement ? ` — ${order.shipping_complement}` : ""}
                <br />
                {order.shipping_neighborhood} — {order.shipping_city}/{order.shipping_state}
                <br />
                CEP {order.shipping_cep}
              </p>
            </section>

            <div className="flex flex-wrap gap-3">
              <Link to="/catalogo" className="btn-primary">
                Continuar comprando
              </Link>
              <Link to="/acompanhar-pedido" className="btn-secondary">
                Acompanhar pedido
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
