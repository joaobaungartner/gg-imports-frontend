import { Link } from "@tanstack/react-router";
import type { AdminOrderListItem } from "@/lib/api";
import { formatCurrency } from "@/lib/formatCurrency";
import {
  formatOrderDate,
  formatPaymentMethod,
  formatShippingMethod,
} from "@/lib/orderFormat";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";

type Props = {
  order: AdminOrderListItem;
};

export function AdminOrderCard({ order }: Props) {
  return (
    <article className="surface-card p-4 lg:hidden">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="editorial-title text-xl">#{order.id}</p>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            {formatOrderDate(order.data_pedido)}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <dl className="mt-4 grid gap-2 text-sm">
        <div className="flex justify-between gap-3">
          <dt className="text-[var(--color-muted)]">Cliente</dt>
          <dd className="text-right font-medium">{order.customer_name ?? "—"}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-[var(--color-muted)]">Itens</dt>
          <dd className="font-medium">{order.item_count}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-[var(--color-muted)]">Total</dt>
          <dd className="font-semibold">{formatCurrency(Number(order.valor_total))}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-[var(--color-muted)]">Modalidade</dt>
          <dd>{formatShippingMethod(order.shipping_method)}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-[var(--color-muted)]">Pagamento</dt>
          <dd>{formatPaymentMethod(order.payment_method)}</dd>
        </div>
      </dl>

      <Link
        to="/admin/pedidos/$orderId"
        params={{ orderId: String(order.id) }}
        className="btn-primary mt-4 w-full"
      >
        Ver detalhes
      </Link>
    </article>
  );
}
