import type { OrderResponse } from "@/lib/api";

const ORDER_STORAGE_PREFIX = "gg_imports_order_";

export function saveOrderConfirmation(order: OrderResponse) {
  sessionStorage.setItem(`${ORDER_STORAGE_PREFIX}${order.id}`, JSON.stringify(order));
}

export function getOrderConfirmation(orderId: number): OrderResponse | null {
  const raw = sessionStorage.getItem(`${ORDER_STORAGE_PREFIX}${orderId}`);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as OrderResponse;
  } catch {
    return null;
  }
}
