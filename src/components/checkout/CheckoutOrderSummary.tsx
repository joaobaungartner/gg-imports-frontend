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
  couponDiscount: number;
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
  couponDiscount,
}: CheckoutOrderSummaryProps) {
  return (
    <aside className="surface-card sticky top-24 h-fit p-6">
      <h2 className="font-display text-lg font-bold text-ink">Resumo do pedido</h2>

      <ul className="mt-5 max-h-64 space-y-3.5 overflow-y-auto border-b border-line pb-5">
        {items.map((item) => (
          <li key={`${item.productId}-${item.tamanho}`} className="flex gap-3">
            <div className="h-14 w-12 shrink-0 overflow-hidden rounded bg-cream">
              {item.imagem_url ? (
                <img src={item.imagem_url} alt={item.nome} className="h-full w-full object-cover" />
              ) : null}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-ink">{item.nome}</p>
              <p className="text-xs text-muted">
                {item.quantidade}x · Tam. {item.tamanho}
              </p>
              <p className="text-sm font-semibold text-forest">
                {formatCurrency(item.preco * item.quantidade)}
              </p>
            </div>
          </li>
        ))}
      </ul>

      <dl className="mt-5 space-y-3 text-sm">
        <div className="flex items-center justify-between text-muted">
          <dt>Itens</dt>
          <dd className="font-medium text-ink">{itemCount}</dd>
        </div>
        {couponDiscount > 0 && (
          <div className="flex items-center justify-between text-muted">
            <dt>Cupom</dt>
            <dd className="font-medium text-forest">-{formatCurrency(couponDiscount)}</dd>
          </div>
        )}
        <div className="flex items-center justify-between text-muted">
          <dt>Subtotal</dt>
          <dd className="font-medium text-ink">{formatCurrency(cartTotal)}</dd>
        </div>
        <div className="flex items-center justify-between text-muted">
          <dt>Frete</dt>
          <dd className="font-medium text-ink">
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
          <p className="text-xs text-muted">{shippingLabel}</p>
        )}
        <div className="border-t border-line pt-3">
          <div className="flex items-center justify-between">
            <dt className="font-semibold text-ink">Total</dt>
            <dd className="font-display text-xl font-bold text-forest">
              {formatCurrency(orderTotal)}
            </dd>
          </div>
        </div>
      </dl>

      <Link to="/carrinho" className="btn-secondary mt-6 w-full">
        Voltar ao carrinho
      </Link>
    </aside>
  );
}
