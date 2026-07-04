import { Link } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import type { CartItem } from "@/lib/cart";
import { formatCurrency } from "@/lib/formatCurrency";

type CheckoutOrderSummaryProps = {
  items: CartItem[];
  itemCount: number;
  cartTotal: number;
  shippingCost: number;
  shippingMethod: "ENTREGA" | "RETIRADA";
  shippingLabel: string;
  loadingShipping: boolean;
  orderTotal: number;
};

export function CheckoutOrderSummary({
  items,
  itemCount,
  cartTotal,
  shippingCost,
  shippingMethod,
  shippingLabel,
  loadingShipping,
  orderTotal,
}: CheckoutOrderSummaryProps) {
  return (
    <aside className="h-fit rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-soft">
      <h2 className="font-display text-xl font-bold text-neutral-900">Resumo do pedido</h2>

      <ul className="mt-5 max-h-64 space-y-4 overflow-y-auto border-b border-neutral-200 pb-5">
        {items.map((item) => (
          <li key={`${item.productId}-${item.tamanho}`} className="flex gap-3">
            <div className="h-16 w-14 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
              {item.imagem_url ? (
                <img src={item.imagem_url} alt={item.nome} className="h-full w-full object-cover" />
              ) : null}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-neutral-900">{item.nome}</p>
              <p className="text-xs text-neutral-500">
                {item.quantidade}x • Tam. {item.tamanho}
              </p>
              <p className="text-sm font-medium text-neutral-800">
                {formatCurrency(item.preco * item.quantidade)}
              </p>
            </div>
          </li>
        ))}
      </ul>

      <dl className="mt-5 space-y-3 text-sm">
        <div className="flex items-center justify-between text-neutral-600">
          <dt>Itens</dt>
          <dd className="font-medium text-neutral-900">{itemCount}</dd>
        </div>
        <div className="flex items-center justify-between text-neutral-600">
          <dt>Subtotal</dt>
          <dd className="font-medium text-neutral-900">{formatCurrency(cartTotal)}</dd>
        </div>
        <div className="flex items-center justify-between text-neutral-600">
          <dt>Frete</dt>
          <dd className="font-medium text-neutral-900">
            {loadingShipping ? (
              <span className="inline-flex items-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin" />
                Calculando...
              </span>
            ) : shippingMethod === "RETIRADA" ? (
              "Grátis"
            ) : shippingCost > 0 ? (
              formatCurrency(shippingCost)
            ) : (
              "A calcular"
            )}
          </dd>
        </div>
        {shippingMethod === "ENTREGA" && !loadingShipping && shippingCost > 0 && (
          <p className="text-xs text-neutral-500">{shippingLabel}</p>
        )}
        <div className="border-t border-neutral-200 pt-3">
          <div className="flex items-center justify-between">
            <dt className="font-semibold text-neutral-900">Total</dt>
            <dd className="font-display text-xl font-bold text-[var(--color-brand-green)]">
              {formatCurrency(orderTotal)}
            </dd>
          </div>
        </div>
      </dl>

      <Link
        to="/carrinho"
        className="mt-6 inline-flex w-full items-center justify-center rounded-full border border-neutral-300 px-6 py-3 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-50"
      >
        Voltar ao carrinho
      </Link>
    </aside>
  );
}
