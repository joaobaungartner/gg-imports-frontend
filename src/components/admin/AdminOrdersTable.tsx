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
  orders: AdminOrderListItem[];
};

export function AdminOrdersTable({ orders }: Props) {
  return (
    <div className="hidden overflow-hidden rounded-[4px] border border-[var(--color-line)] lg:block">
      <table className="min-w-full divide-y divide-[var(--color-line)] text-left text-sm">
        <thead className="bg-[var(--color-cream)] text-xs uppercase tracking-wide text-[var(--color-muted)]">
          <tr>
            <th className="px-4 py-3 font-semibold">Pedido</th>
            <th className="px-4 py-3 font-semibold">Data</th>
            <th className="px-4 py-3 font-semibold">Cliente</th>
            <th className="px-4 py-3 font-semibold">Itens</th>
            <th className="px-4 py-3 font-semibold">Total</th>
            <th className="px-4 py-3 font-semibold">Modalidade</th>
            <th className="px-4 py-3 font-semibold">Pagamento</th>
            <th className="px-4 py-3 font-semibold">Status</th>
            <th className="px-4 py-3 font-semibold">Ação</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--color-line)] bg-[var(--color-canvas)]">
          {orders.map((order) => (
            <tr key={order.id} className="hover:bg-[var(--color-cream)]/60">
              <td className="px-4 py-3 font-semibold text-[var(--color-ink)]">#{order.id}</td>
              <td className="px-4 py-3 text-[var(--color-muted)]">
                {formatOrderDate(order.data_pedido)}
              </td>
              <td className="px-4 py-3">
                <p className="font-medium text-[var(--color-ink)]">
                  {order.customer_name ?? "—"}
                </p>
                <p className="text-xs text-[var(--color-muted)]">{order.customer_email}</p>
              </td>
              <td className="px-4 py-3">{order.item_count}</td>
              <td className="px-4 py-3 font-semibold">
                {formatCurrency(Number(order.valor_total))}
              </td>
              <td className="px-4 py-3">{formatShippingMethod(order.shipping_method)}</td>
              <td className="px-4 py-3">{formatPaymentMethod(order.payment_method)}</td>
              <td className="px-4 py-3">
                <OrderStatusBadge status={order.status} />
              </td>
              <td className="px-4 py-3">
                <Link
                  to="/admin/pedidos/$orderId"
                  params={{ orderId: String(order.id) }}
                  className="btn-ghost !px-0 font-semibold"
                >
                  Ver detalhes
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
