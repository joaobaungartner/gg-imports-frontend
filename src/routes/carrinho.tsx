import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ShoppingBag } from "lucide-react";
import { useState } from "react";
import { CartItemCard } from "@/components/cart/CartItemCard";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { formatCurrency } from "@/lib/formatCurrency";

export const Route = createFileRoute("/carrinho")({
  component: CarrinhoPage,
});

const FREE_SHIPPING_THRESHOLD = 399;

function CarrinhoPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { items, itemCount, cartTotal, removeFromCart, updateQuantity, clearCart } = useCart();
  const [actionError, setActionError] = useState("");
  const isCartEmpty = items.length === 0;

  const freeShippingProgress = Math.min((cartTotal / FREE_SHIPPING_THRESHOLD) * 100, 100);
  const remainingForFreeShipping = Math.max(FREE_SHIPPING_THRESHOLD - cartTotal, 0);
  const qualifiesForFreeShippingVisual = cartTotal >= FREE_SHIPPING_THRESHOLD;

  function handleUpdateQuantity(productId: number, tamanho: string, quantidade: number) {
    setActionError("");

    try {
      updateQuantity(productId, tamanho, quantidade);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Não foi possível atualizar a quantidade.";
      setActionError(message);
      throw err;
    }
  }

  function handleClearCart() {
    const confirmed = window.confirm("Tem certeza que deseja remover todos os itens do carrinho?");
    if (!confirmed) return;

    clearCart();
    setActionError("");
  }

  function handleCheckout() {
    if (isCartEmpty) return;

    if (isAuthenticated) {
      navigate({ to: "/checkout" });
      return;
    }

    navigate({ to: "/login", search: { redirect: "/checkout" } });
  }

  if (items.length === 0) {
    return (
      <div className="container-page py-12 lg:py-16">
        <div className="surface-card mx-auto max-w-lg px-6 py-16 text-center">
          <span className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded bg-cream text-muted">
            <ShoppingBag className="h-7 w-7" />
          </span>
          <p className="eyebrow mb-3 justify-center">Carrinho</p>
          <h1 className="editorial-title text-3xl sm:text-4xl">Vazio por enquanto</h1>
          <p className="mt-3 text-sm text-muted">
            Adicione produtos do catálogo para continuar.
          </p>
          <Link to="/catalogo" className="btn-primary mt-8">
            Ver catálogo
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page py-12 lg:py-16">
      <div className="mb-8">
        <p className="eyebrow mb-2">{itemCount} {itemCount === 1 ? "item" : "itens"}</p>
        <h1 className="editorial-title text-3xl sm:text-4xl lg:text-5xl">Carrinho</h1>
        <p className="mt-3 max-w-xl text-sm text-muted">
          Revise seus produtos antes de finalizar o pedido.
        </p>
      </div>

      {actionError && <div className="alert-error mb-6">{actionError}</div>}

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
        <div className="space-y-3">
          {items.map((item) => (
            <CartItemCard
              key={`${item.productId}-${item.tamanho}`}
              item={item}
              onUpdateQuantity={handleUpdateQuantity}
              onRemove={removeFromCart}
            />
          ))}
        </div>

        <aside className="surface-card sticky top-24 h-fit p-6">
          <h2 className="font-display text-lg font-bold text-ink">Resumo do pedido</h2>

          <div className="mt-5 rounded border border-line bg-cream/60 px-3.5 py-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted">
                Frete grátis
              </p>
              {qualifiesForFreeShippingVisual ? (
                <span className="tag-lime">Elegível</span>
              ) : (
                <span className="text-xs text-muted">
                  Faltam {formatCurrency(remainingForFreeShipping)}
                </span>
              )}
            </div>
            <div className="h-1 overflow-hidden rounded-full bg-line">
              <div
                className="h-full rounded-full bg-forest-mid transition-all duration-300"
                style={{ width: `${freeShippingProgress}%` }}
              />
            </div>
            <p className="mt-2 text-[11px] text-muted">
              Frete grátis acima de {formatCurrency(FREE_SHIPPING_THRESHOLD)}
            </p>
          </div>

          <dl className="mt-5 space-y-3 text-sm">
            <div className="flex items-center justify-between text-muted">
              <dt>Itens</dt>
              <dd className="font-medium text-ink">{itemCount}</dd>
            </div>
            <div className="flex items-center justify-between text-muted">
              <dt>Subtotal</dt>
              <dd className="font-medium text-ink">{formatCurrency(cartTotal)}</dd>
            </div>
            <div className="flex items-center justify-between text-muted">
              <dt>Frete</dt>
              <dd className="font-medium text-ink">A combinar</dd>
            </div>
            <div className="border-t border-line pt-3">
              <div className="flex items-center justify-between">
                <dt className="font-semibold text-ink">Total</dt>
                <dd className="font-display text-xl font-bold text-forest">
                  {formatCurrency(cartTotal)}
                </dd>
              </div>
            </div>
          </dl>

          <div className="mt-6 space-y-2.5">
            <button
              type="button"
              onClick={handleCheckout}
              disabled={isCartEmpty}
              className="btn-primary w-full"
            >
              Finalizar pedido
            </button>
            <Link to="/catalogo" className="btn-secondary w-full">
              Continuar comprando
            </Link>
            <button
              type="button"
              onClick={handleClearCart}
              className="btn-ghost w-full justify-center text-danger hover:text-danger"
            >
              Limpar carrinho
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
