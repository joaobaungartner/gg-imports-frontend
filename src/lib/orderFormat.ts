export function formatOrderStatus(status: string) {
  const labels: Record<string, string> = {
    PENDING_PAYMENT: "Aguardando pagamento",
    PAID: "Pagamento confirmado",
    PREPARING: "Em preparação",
    SHIPPED: "Enviado",
    READY_FOR_PICKUP: "Pronto para retirada",
    DELIVERED: "Entregue",
    CANCELED: "Cancelado",
  };
  return labels[status] ?? status;
}

export function formatPaymentMethod(method: string | null | undefined) {
  if (method === "PIX") return "Pix";
  if (method === "CARTAO") return "Cartão";
  return method ?? "—";
}

export function formatPaymentStatus(status: string | null | undefined) {
  if (!status) return "Não informado";
  const labels: Record<string, string> = {
    PENDING: "Pendente",
    APPROVED: "Aprovado",
    PAID: "Pago",
    REJECTED: "Recusado",
    CANCELED: "Cancelado",
    REFUNDED: "Estornado",
  };
  return labels[status] ?? status;
}

export function formatShippingMethod(method: string | null | undefined) {
  if (method === "RETIRADA") return "Retirada";
  if (method === "ENTREGA") return "Entrega";
  if (method === "FRETE_A_COMBINAR") return "Entrega";
  return "A combinar";
}

export function formatOrderDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

export function formatOrderDateTime(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function getOrderStatusColor(status: string) {
  switch (status) {
    case "PENDING_PAYMENT":
      return "bg-amber-100 text-amber-900 border-amber-200";
    case "PAID":
      return "bg-sky-100 text-sky-900 border-sky-200";
    case "PREPARING":
      return "bg-indigo-100 text-indigo-900 border-indigo-200";
    case "SHIPPED":
      return "bg-violet-100 text-violet-900 border-violet-200";
    case "READY_FOR_PICKUP":
      return "bg-teal-100 text-teal-900 border-teal-200";
    case "DELIVERED":
      return "bg-emerald-100 text-emerald-900 border-emerald-200";
    case "CANCELED":
      return "bg-red-100 text-red-900 border-red-200";
    default:
      return "bg-neutral-100 text-neutral-800 border-neutral-200";
  }
}

export function customerStatusMessage(status: string) {
  const messages: Record<string, string> = {
    PENDING_PAYMENT: "Recebemos o seu pedido.",
    PAID: "O pagamento foi confirmado.",
    PREPARING: "Seu pedido está sendo preparado.",
    SHIPPED: "Seu pedido foi enviado.",
    READY_FOR_PICKUP: "Seu pedido está pronto para retirada.",
    DELIVERED: "Pedido entregue.",
    CANCELED: "Pedido cancelado.",
  };
  return messages[status] ?? formatOrderStatus(status);
}

export const ORDER_STATUS_OPTIONS = [
  { value: "PENDING_PAYMENT", label: "Aguardando pagamento" },
  { value: "PAID", label: "Pagamento confirmado" },
  { value: "PREPARING", label: "Em preparação" },
  { value: "SHIPPED", label: "Enviado" },
  { value: "READY_FOR_PICKUP", label: "Pronto para retirada" },
  { value: "DELIVERED", label: "Entregue" },
  { value: "CANCELED", label: "Cancelado" },
] as const;

export function isCriticalStatusTransition(current: string, next: string) {
  if (next === "CANCELED") return true;
  if (current === "DELIVERED" || current === "CANCELED") return true;
  return false;
}
