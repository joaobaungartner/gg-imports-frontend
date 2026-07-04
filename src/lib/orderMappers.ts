import type { OrderListItem, OrderResponse } from "@/lib/api";

export function orderResponseToListItem(order: OrderResponse): OrderListItem {
  const itemCount = order.itens.reduce(
    (total, item) => total + (item.ativo ? item.quantidade : 0),
    0,
  );

  return {
    id: order.id,
    client_id: order.client_id,
    customer_name: order.customer_name,
    data_pedido: order.data_pedido,
    subtotal: order.subtotal,
    frete: order.frete,
    valor_total: order.valor_total,
    status: order.status,
    ativo: order.ativo,
    item_count: itemCount,
    payment_method: order.payment_method,
    shipping_method: order.shipping_method,
  };
}
