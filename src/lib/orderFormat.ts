export function formatOrderStatus(status: string) {
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

export function formatPaymentMethod(method: string | null) {
  if (method === "PIX") return "Pix";
  if (method === "CARTAO") return "Cartão";
  return method ?? "—";
}

export function formatShippingMethod(method: string | null) {
  if (method === "RETIRADA") return "Retirada/combinar com a loja";
  if (method === "ENTREGA") return "Entrega";
  if (method === "FRETE_A_COMBINAR") return "Entrega";
  return "A combinar";
}

export function formatOrderDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "long",
  }).format(new Date(value));
}

export function getOrderStatusColor(status: string) {
  switch (status) {
    case "PENDING_PAYMENT":
      return "bg-amber-100 text-amber-800";
    case "PAID":
      return "bg-blue-100 text-blue-800";
    case "PREPARING":
      return "bg-indigo-100 text-indigo-800";
    case "SHIPPED":
      return "bg-purple-100 text-purple-800";
    case "DELIVERED":
      return "bg-green-100 text-green-800";
    case "CANCELED":
      return "bg-red-100 text-red-800";
    default:
      return "bg-neutral-100 text-neutral-700";
  }
}
