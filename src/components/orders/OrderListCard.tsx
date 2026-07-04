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
    <article className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-soft sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-3">
          <div>
            <h2 className="font-display text-xl font-bold text-neutral-900">Pedido #{order.id}</h2>
            <p className="mt-1 text-sm text-neutral-600">
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
              <dt className="text-neutral-500">Itens</dt>
              <dd className="font-medium text-neutral-900">{order.item_count}</dd>
            </div>
            <div>
              <dt className="text-neutral-500">Total</dt>
              <dd className="font-semibold text-[var(--color-brand-green)]">
                {formatCurrency(Number(order.valor_total))}
              </dd>
            </div>
            <div>
              <dt className="text-neutral-500">Pagamento</dt>
              <dd className="font-medium text-neutral-900">
                {formatPaymentMethod(order.payment_method)}
              </dd>
            </div>
            <div>
              <dt className="text-neutral-500">Entrega</dt>
              <dd className="font-medium text-neutral-900">
                {formatShippingMethod(order.shipping_method)}
              </dd>
            </div>
          </dl>
        </div>

        <Link
          to="/pedido/$orderId"
          params={{ orderId: String(order.id) }}
          className="inline-flex shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-green)] px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          Ver detalhes
        </Link>
      </div>
    </article>
  );
}
