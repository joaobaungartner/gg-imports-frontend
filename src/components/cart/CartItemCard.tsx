import { Minus, Plus, Shirt, Trash2 } from "lucide-react";
import { useState } from "react";
import { formatCurrency } from "@/lib/formatCurrency";
import type { CartItem } from "@/lib/cart";

type CartItemCardProps = {
  item: CartItem;
  onUpdateQuantity: (productId: number, tamanho: string, quantidade: number) => void;
  onRemove: (productId: number, tamanho: string) => void;
};

export function CartItemCard({ item, onUpdateQuantity, onRemove }: CartItemCardProps) {
  const [error, setError] = useState("");
  const subtotal = item.preco * item.quantidade;
  const outOfStock = item.estoque !== undefined && item.estoque <= 0;

  function handleQuantityChange(nextQuantity: number) {
    setError("");

    try {
      onUpdateQuantity(item.productId, item.tamanho, nextQuantity);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Não foi possível atualizar a quantidade.";
      setError(message);
    }
  }

  return (
    <article className="surface-card p-4 sm:p-5">
      <div className="flex gap-4">
        <div className="h-24 w-20 shrink-0 overflow-hidden rounded bg-cream sm:h-28 sm:w-24">
          {item.imagem_url ? (
            <img
              src={item.imagem_url}
              alt={item.nome}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-muted">
              <Shirt className="h-7 w-7" />
              <span className="text-[10px] font-medium">Sem imagem</span>
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 space-y-1">
              {item.clube && (
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
                  {item.clube}
                </p>
              )}
              <h2 className="font-display text-base font-bold leading-snug text-ink sm:text-lg">
                {item.nome}
              </h2>
              {(item.categoria || item.tipo) && (
                <p className="text-sm text-muted">
                  {[item.categoria, item.tipo].filter(Boolean).join(" · ")}
                </p>
              )}
              <p className="text-sm text-muted">
                Tamanho{" "}
                <span className="font-semibold text-ink">{item.tamanho}</span>
              </p>
              <p className="pt-0.5 text-sm font-semibold text-forest">
                {formatCurrency(item.preco)}
              </p>
            </div>

            <button
              type="button"
              onClick={() => onRemove(item.productId, item.tamanho)}
              className="shrink-0 rounded p-2 text-muted transition-colors hover:bg-cream hover:text-danger"
              aria-label="Remover item"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>

          {outOfStock && (
            <p className="mt-3 rounded border border-[color-mix(in_srgb,var(--color-danger)_25%,white)] bg-[color-mix(in_srgb,var(--color-danger)_8%,white)] px-3 py-2 text-xs text-[#9f2d22]">
              Este tamanho está sem estoque no momento.
            </p>
          )}

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center overflow-hidden rounded border border-line">
              <button
                type="button"
                onClick={() => handleQuantityChange(item.quantidade - 1)}
                className="flex h-8 w-8 items-center justify-center text-muted transition-colors hover:bg-cream"
                aria-label="Diminuir quantidade"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="min-w-8 text-center text-sm font-semibold text-ink">
                {item.quantidade}
              </span>
              <button
                type="button"
                onClick={() => handleQuantityChange(item.quantidade + 1)}
                disabled={item.estoque !== undefined && item.quantidade >= item.estoque}
                className="flex h-8 w-8 items-center justify-center text-muted transition-colors hover:bg-cream disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Aumentar quantidade"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>

            <p className="text-sm text-muted">
              Subtotal{" "}
              <span className="font-semibold text-ink">{formatCurrency(subtotal)}</span>
            </p>
          </div>

          {error && <p className="alert-error mt-3 text-xs">{error}</p>}

          <button
            type="button"
            onClick={() => onRemove(item.productId, item.tamanho)}
            className="mt-3 text-sm font-medium text-muted transition-colors hover:text-danger sm:hidden"
          >
            Remover
          </button>
        </div>
      </div>
    </article>
  );
}
