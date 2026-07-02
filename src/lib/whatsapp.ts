import { formatCurrency } from "@/lib/formatCurrency";
import type { CartItem } from "@/lib/cart";

const WHATSAPP_NUMBER = "5519998460550";

export function buildWhatsAppCheckoutUrl(items: CartItem[]): string {
  const lines = [
    "Olá! Quero finalizar meu pedido na GG Imports:",
    "",
  ];

  items.forEach((item, index) => {
    const subtotal = item.preco * item.quantidade;
    lines.push(`${item.quantidade}x ${item.nome}`);
    lines.push(`Tamanho: ${item.tamanho}`);

    if (item.quantidade === 1) {
      lines.push(`Preço: ${formatCurrency(item.preco)}`);
    } else {
      lines.push(`Preço unitário: ${formatCurrency(item.preco)}`);
      lines.push(`Subtotal: ${formatCurrency(subtotal)}`);
    }

    if (index < items.length - 1) {
      lines.push("");
    }
  });

  lines.push("");
  lines.push(`Total: ${formatCurrency(getOrderTotal(items))}`);
  lines.push("");
  lines.push("Aguardo informações sobre pagamento e entrega.");

  const message = lines.join("\n");
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

function getOrderTotal(items: CartItem[]): number {
  return items.reduce((total, item) => total + item.preco * item.quantidade, 0);
}
