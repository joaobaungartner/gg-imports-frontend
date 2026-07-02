import { createFileRoute, Link } from "@tanstack/react-router";
import { ShoppingBag } from "lucide-react";
import { useState } from "react";
import { CartItemCard } from "@/components/cart/CartItemCard";
import { useCart } from "@/contexts/CartContext";
import { formatCurrency } from "@/lib/formatCurrency";
import { buildWhatsAppCheckoutUrl } from "@/lib/whatsapp";

export const Route = createFileRoute("/carrinho")({
  component: CarrinhoPage,
});

function CarrinhoPage() {
  const { items, itemCount, cartTotal, removeFromCart, updateQuantity, clearCart } = useCart();
  const [actionError, setActionError] = useState("");

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
    if (items.length === 0) return;
    window.open(buildWhatsAppCheckoutUrl(items), "_blank", "noopener,noreferrer");
  }

  if (items.length === 0) {
    return (
      <div className="container-page py-12 lg:py-16">
        <div className="mx-auto max-w-lg rounded-3xl border border-neutral-200/80 bg-white px-6 py-16 text-center shadow-soft">
          <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-neutral-100 text-neutral-500">
            <ShoppingBag className="h-7 w-7" />
          </span>
          <h1 className="font-display text-3xl font-bold text-neutral-900">Carrinho</h1>
          <p className="mt-4 text-lg font-medium text-neutral-900">Seu carrinho está vazio.</p>
          <p className="mt-2 text-sm text-neutral-600">
            Adicione produtos do catálogo para continuar.
          </p>
          <Link
            to="/catalogo"
            className="mt-8 inline-flex items-center justify-center rounded-full bg-[var(--color-brand-green)] px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            Ver catálogo
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page py-12 lg:py-16">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-neutral-900">Carrinho</h1>
        <p className="mt-2 text-neutral-600">Revise seus produtos antes de finalizar o pedido.</p>
      </div>

      {actionError && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {actionError}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-4">
          {items.map((item) => (
            <CartItemCard
              key={`${item.productId}-${item.tamanho}`}
              item={item}
              onUpdateQuantity={handleUpdateQuantity}
              onRemove={removeFromCart}
            />
          ))}
        </div>

        <aside className="h-fit rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-soft">
          <h2 className="font-display text-xl font-bold text-neutral-900">Resumo do pedido</h2>

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
              <dd className="font-medium text-neutral-900">A combinar</dd>
            </div>
            <div className="border-t border-neutral-200 pt-3">
              <div className="flex items-center justify-between">
                <dt className="font-semibold text-neutral-900">Total</dt>
                <dd className="font-display text-xl font-bold text-[var(--color-brand-green)]">
                  {formatCurrency(cartTotal)}
                </dd>
              </div>
            </div>
          </dl>

          <div className="mt-6 space-y-3">
            <button
              type="button"
              onClick={handleCheckout}
              className="inline-flex w-full items-center justify-center rounded-full bg-[var(--color-brand-green)] px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              Finalizar pedido
            </button>
            <Link
              to="/catalogo"
              className="inline-flex w-full items-center justify-center rounded-full border border-neutral-300 px-6 py-3 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-50"
            >
              Continuar comprando
            </Link>
            <button
              type="button"
              onClick={handleClearCart}
              className="inline-flex w-full items-center justify-center rounded-full border border-red-200 px-6 py-3 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
            >
              Limpar carrinho
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
