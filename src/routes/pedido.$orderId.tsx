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
      <div className="container-page flex min-h-[50vh] items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--color-brand-green)]" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container-page py-12 lg:py-16">
        <div className="mx-auto max-w-lg rounded-3xl border border-neutral-200/80 bg-white px-6 py-16 text-center shadow-soft">
          <h1 className="font-display text-3xl font-bold text-neutral-900">Pedido não encontrado</h1>
          <p className="mt-4 text-neutral-600">{error || "Não foi possível localizar este pedido."}</p>
          <Link
            to="/catalogo"
            className="mt-8 inline-flex items-center justify-center rounded-full bg-[var(--color-brand-green)] px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            Ver catálogo
          </Link>
        </div>
      </div>
    );
  }

  const isPix = order.payment_method === "PIX";

  return (
    <div className="container-page py-12 lg:py-16">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 text-center">
          <span className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)]">
            <CheckCircle2 className="h-8 w-8" />
          </span>
          <h1 className="font-display text-3xl font-bold text-neutral-900">Pedido criado com sucesso!</h1>
          <p className="mt-2 text-neutral-600">
            Seu pedido #{order.id} foi registrado em {formatOrderDate(order.data_pedido)}.
          </p>
        </div>

        <div className="space-y-6">
          <section className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-soft">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm text-neutral-500">Número do pedido</p>
                <p className="font-display text-2xl font-bold text-neutral-900">#{order.id}</p>
              </div>
              <button
                type="button"
                onClick={handleCopyOrderId}
                className="inline-flex items-center gap-2 rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
              >
                <Copy className="h-4 w-4" />
                {copied ? "Copiado!" : "Copiar número"}
              </button>
            </div>

            <dl className="mt-6 grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm text-neutral-500">Status</dt>
                <dd className="mt-1 text-sm font-semibold text-neutral-900">
                  {formatStatus(order.status)}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-neutral-500">Pagamento</dt>
                <dd className="mt-1 text-sm font-semibold text-neutral-900">
                  {order.payment_method === "PIX" ? "Pix" : order.payment_method}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-neutral-500">Entrega</dt>
                <dd className="mt-1 text-sm font-semibold text-neutral-900">
                  {formatShippingMethod(order.shipping_method)}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-neutral-500">Total</dt>
                <dd className="mt-1 font-display text-lg font-bold text-[var(--color-brand-green)]">
                  {formatCurrency(Number(order.valor_total))}
                </dd>
              </div>
            </dl>
          </section>

          {isPix && (
            <section className="rounded-2xl border border-[var(--color-brand-green)]/20 bg-[var(--color-brand-green)]/5 p-6 shadow-soft">
              <h2 className="font-display text-xl font-bold text-neutral-900">Instruções de pagamento via Pix</h2>
              <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-neutral-700">
                <li>
                  Entre em contato pelo WhatsApp{" "}
                  <span className="font-semibold text-neutral-900">{PIX_CONTACT}</span> informando o
                  número do pedido <span className="font-semibold">#{order.id}</span>.
                </li>
                <li>Nossa equipe enviará a chave Pix e confirmará o valor total do pedido.</li>
                <li>
                  Após o pagamento, seu pedido será atualizado para o status{" "}
                  <span className="font-semibold">Pago</span> e iniciaremos a preparação.
                </li>
              </ol>
              <p className="mt-4 text-sm text-neutral-600">
                Valor do pedido:{" "}
                <span className="font-semibold text-neutral-900">
                  {formatCurrency(Number(order.valor_total))}
                </span>
              </p>
            </section>
          )}

          <section className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-soft">
            <h2 className="font-display text-xl font-bold text-neutral-900">Itens do pedido</h2>
            <ul className="mt-5 space-y-4">
              {order.itens.map((item) => (
                <li
                  key={item.id}
                  className="flex gap-4 border-b border-neutral-100 pb-4 last:border-b-0 last:pb-0"
                >
                  <div className="h-20 w-16 shrink-0 overflow-hidden rounded-xl bg-neutral-100">
                    {item.imagem_url ? (
                      <img
                        src={item.imagem_url}
                        alt={item.nome_produto ?? "Produto"}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-neutral-400">
                        <Shirt className="h-6 w-6" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-neutral-900">
                      {item.nome_produto ?? `Produto #${item.product_id}`}
                    </p>
                    <p className="text-sm text-neutral-500">
                      {item.quantidade}x • Tam. {item.tamanho ?? "-"}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-neutral-800">
                      {formatCurrency(Number(item.subtotal))}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-soft">
            <h2 className="font-display text-xl font-bold text-neutral-900">Entrega</h2>
            <p className="mt-3 text-sm text-neutral-700">
              {order.shipping_street}, {order.shipping_number}
              {order.shipping_complement ? ` — ${order.shipping_complement}` : ""}
              <br />
              {order.shipping_neighborhood} — {order.shipping_city}/{order.shipping_state}
              <br />
              CEP {order.shipping_cep}
            </p>
          </section>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/catalogo"
              className="inline-flex items-center justify-center rounded-full bg-[var(--color-brand-green)] px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              Continuar comprando
            </Link>
            <Link
              to="/acompanhar-pedido"
              className="inline-flex items-center justify-center rounded-full border border-neutral-300 px-6 py-3 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-50"
            >
              Acompanhar pedido
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
