import { Link } from "@tanstack/react-router";
import type { OrderListItem } from "@/lib/api";
import {
  formatOrderDate,
  formatOrderStatus,
  formatPaymentMethod,
  formatShippingMethod,
  getOrderStatusColor,
} from "@/lib/orderFormat";
import { formatCurrency } from "@/lib/formatCurrency";

type OrderListCardProps = {
  order: OrderListItem;
};

export function OrderListCard({ order }: OrderListCardProps) {
  return (
    <article className="surface-card p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-3">
          <div>
            <h2 className="editorial-title text-xl">Pedido #{order.id}</h2>
            <p className="mt-1 text-sm text-[var(--color-muted)]">
              Realizado em {formatOrderDate(order.data_pedido)}
            </p>
          </div>

          <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getOrderStatusColor(order.status)}`}
          >
            {formatOrderStatus(order.status)}
          </span>

          <dl className="grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-[var(--color-muted)]">Itens</dt>
              <dd className="font-medium text-[var(--color-ink)]">{order.item_count}</dd>
            </div>
            <div>
              <dt className="text-[var(--color-muted)]">Total</dt>
              <dd className="font-semibold text-[var(--color-forest)]">
                {formatCurrency(Number(order.valor_total))}
              </dd>
            </div>
            <div>
              <dt className="text-[var(--color-muted)]">Pagamento</dt>
              <dd className="font-medium text-[var(--color-ink)]">
                {formatPaymentMethod(order.payment_method)}
              </dd>
            </div>
            <div>
              <dt className="text-[var(--color-muted)]">Entrega</dt>
              <dd className="font-medium text-[var(--color-ink)]">
                {formatShippingMethod(order.shipping_method)}
              </dd>
            </div>
          </dl>
        </div>

        <Link
          to="/pedido/$orderId"
          params={{ orderId: String(order.id) }}
          className="btn-primary shrink-0"
        >
          Ver detalhes
        </Link>
      </div>
    </article>
  );
}
