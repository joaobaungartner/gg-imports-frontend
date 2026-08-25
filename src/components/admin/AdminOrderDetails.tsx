import { Shirt } from "lucide-react";
import { useEffect, useState } from "react";
import type { AdminOrderDetail } from "@/lib/api";
import { formatCurrency } from "@/lib/formatCurrency";
import {
  formatOrderDateTime,
  formatPaymentMethod,
  formatPaymentStatus,
  formatShippingMethod,
} from "@/lib/orderFormat";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import { AdminOrderStatusTimeline } from "@/components/admin/AdminOrderStatusTimeline";
import { UpdateOrderStatusForm } from "@/components/admin/UpdateOrderStatusForm";

type Props = {
  order: AdminOrderDetail;
  savingStatus: boolean;
  savingNotes: boolean;
  successMessage: string;
  onUpdateStatus: (payload: {
    status: string;
    note?: string;
    force?: boolean;
  }) => Promise<void>;
  onSaveNotes: (notes: string | null) => Promise<void>;
};

export function AdminOrderDetails({
  order,
  savingStatus,
  savingNotes,
  successMessage,
  onUpdateStatus,
  onSaveNotes,
}: Props) {
  const [notes, setNotes] = useState(order.admin_notes ?? "");
  const isRetirada = (order.shipping_method || "").toUpperCase() === "RETIRADA";

  useEffect(() => {
    setNotes(order.admin_notes ?? "");
  }, [order.id, order.admin_notes]);

  return (
    <div className="space-y-5">
      {successMessage ? (
        <div className="alert-success" role="status">
          {successMessage}
        </div>
      ) : null}

      <section className="surface-card p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="eyebrow">Pedido</p>
            <h1 className="editorial-title mt-2 text-3xl">#{order.id}</h1>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>
        <dl className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-sm">
          <div>
            <dt className="text-[var(--color-muted)]">Criado em</dt>
            <dd className="mt-1 font-medium">{formatOrderDateTime(order.data_pedido)}</dd>
          </div>
          <div>
            <dt className="text-[var(--color-muted)]">Atualizado em</dt>
            <dd className="mt-1 font-medium">
              {order.updated_at ? formatOrderDateTime(order.updated_at) : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--color-muted)]">Modalidade</dt>
            <dd className="mt-1 font-medium">{formatShippingMethod(order.shipping_method)}</dd>
          </div>
          <div>
            <dt className="text-[var(--color-muted)]">Total</dt>
            <dd className="mt-1 font-semibold text-[var(--color-forest)]">
              {formatCurrency(Number(order.valor_total))}
            </dd>
          </div>
        </dl>
      </section>

      <section className="surface-card p-5 sm:p-6">
        <h2 className="editorial-title text-xl">Cliente</h2>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2 text-sm">
          <div>
            <dt className="text-[var(--color-muted)]">Nome</dt>
            <dd className="mt-1 font-medium">{order.customer_name ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-[var(--color-muted)]">E-mail</dt>
            <dd className="mt-1 font-medium">{order.customer_email ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-[var(--color-muted)]">Telefone</dt>
            <dd className="mt-1 font-medium">{order.customer_phone ?? "—"}</dd>
          </div>
          {order.customer_cpf ? (
            <div>
              <dt className="text-[var(--color-muted)]">CPF</dt>
              <dd className="mt-1 font-medium">{order.customer_cpf}</dd>
            </div>
          ) : null}
        </dl>
      </section>

      <section className="surface-card p-5 sm:p-6">
        <h2 className="editorial-title text-xl">Produtos</h2>
        <ul className="mt-4 space-y-4">
          {order.itens.map((item) => (
            <li
              key={item.id}
              className="flex gap-4 border-b border-[var(--color-line)] pb-4 last:border-0 last:pb-0"
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
                <p className="font-medium">{item.nome_produto ?? `Produto #${item.product_id}`}</p>
                <p className="text-sm text-[var(--color-muted)]">
                  Tam. {item.tamanho ?? "—"} · Qtd. {item.quantidade}
                </p>
                <p className="mt-1 text-sm">
                  {formatCurrency(Number(item.preco_unitario))} · Subtotal{" "}
                  {formatCurrency(Number(item.subtotal))}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="surface-card p-5 sm:p-6">
        <h2 className="editorial-title text-xl">
          {isRetirada ? "Retirada" : "Endereço e entrega"}
        </h2>
        {isRetirada ? (
          <p className="mt-3 text-sm leading-relaxed text-[var(--color-ink)]">
            Modalidade: Retirada. Combinar local e horário com a loja pelo WhatsApp após a
            confirmação do pagamento.
          </p>
        ) : (
          <p className="mt-3 text-sm leading-relaxed text-[var(--color-ink)]">
            {order.customer_name}
            <br />
            {order.shipping_street}, {order.shipping_number}
            {order.shipping_complement ? ` — ${order.shipping_complement}` : ""}
            <br />
            {order.shipping_neighborhood} — {order.shipping_city}/{order.shipping_state}
            <br />
            CEP {order.shipping_cep}
            <br />
            Frete: {formatCurrency(Number(order.frete))}
          </p>
        )}
      </section>

      <section className="surface-card p-5 sm:p-6">
        <h2 className="editorial-title text-xl">Pagamento</h2>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2 text-sm">
          <div>
            <dt className="text-[var(--color-muted)]">Método</dt>
            <dd className="mt-1 font-medium">{formatPaymentMethod(order.payment_method)}</dd>
          </div>
          <div>
            <dt className="text-[var(--color-muted)]">Status do pagamento</dt>
            <dd className="mt-1 font-medium">{formatPaymentStatus(order.payment_status)}</dd>
          </div>
          <div>
            <dt className="text-[var(--color-muted)]">Subtotal</dt>
            <dd className="mt-1 font-medium">{formatCurrency(Number(order.subtotal))}</dd>
          </div>
          <div>
            <dt className="text-[var(--color-muted)]">Frete</dt>
            <dd className="mt-1 font-medium">{formatCurrency(Number(order.frete))}</dd>
          </div>
          {Number(order.desconto_cupom) > 0 ? (
            <div>
              <dt className="text-[var(--color-muted)]">Desconto</dt>
              <dd className="mt-1 font-medium">
                -{formatCurrency(Number(order.desconto_cupom))}
              </dd>
            </div>
          ) : null}
          <div>
            <dt className="text-[var(--color-muted)]">Total</dt>
            <dd className="mt-1 font-semibold">{formatCurrency(Number(order.valor_total))}</dd>
          </div>
        </dl>
      </section>

      <section className="overflow-hidden rounded-[4px] border border-[var(--color-forest)]/25 bg-[var(--color-cream)] p-5 sm:p-6">
        <h2 className="editorial-title text-xl">Administração</h2>
        <div className="mt-5 grid gap-8 lg:grid-cols-2">
          <UpdateOrderStatusForm
            currentStatus={order.status}
            shippingMethod={order.shipping_method}
            allowedTransitions={order.allowed_transitions}
            saving={savingStatus}
            onSubmit={onUpdateStatus}
          />
          <div>
            <label htmlFor="admin-notes" className="field-label">
              Observações internas
            </label>
            <textarea
              id="admin-notes"
              className="field-input min-h-32"
              value={notes}
              disabled={savingNotes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Visível apenas para administradores"
            />
            <button
              type="button"
              className="btn-secondary mt-3"
              disabled={savingNotes}
              onClick={() => void onSaveNotes(notes.trim() || null)}
            >
              {savingNotes ? "Salvando…" : "Salvar observações"}
            </button>
          </div>
        </div>
      </section>

      <section className="surface-card p-5 sm:p-6">
        <h2 className="editorial-title text-xl">Histórico</h2>
        <div className="mt-5">
          <AdminOrderStatusTimeline items={order.status_history} />
        </div>
      </section>
    </div>
  );
}
