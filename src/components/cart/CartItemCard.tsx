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
    <article className="rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-soft sm:p-5">
      <div className="flex gap-4">
        <div className="h-28 w-24 shrink-0 overflow-hidden rounded-xl bg-neutral-100 sm:h-32 sm:w-28">
          {item.imagem_url ? (
            <img
              src={item.imagem_url}
              alt={item.nome}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-neutral-400">
              <Shirt className="h-8 w-8" />
              <span className="text-[10px] font-medium">Sem imagem</span>
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 space-y-1">
              {item.clube && (
                <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  {item.clube}
                </p>
              )}
              <h2 className="font-display text-base font-semibold text-neutral-900 sm:text-lg">
                {item.nome}
              </h2>
              {(item.categoria || item.tipo) && (
                <p className="text-sm text-neutral-500">
                  {[item.categoria, item.tipo].filter(Boolean).join(" • ")}
                </p>
              )}
              <p className="text-sm text-neutral-700">
                Tamanho: <span className="font-medium text-neutral-900">{item.tamanho}</span>
              </p>
              <p className="text-sm font-medium text-neutral-900">{formatCurrency(item.preco)}</p>
            </div>

            <button
              type="button"
              onClick={() => onRemove(item.productId, item.tamanho)}
              className="shrink-0 rounded-full p-2 text-red-600 transition-colors hover:bg-red-50"
              aria-label="Remover item"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>

          {outOfStock && (
            <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
              Este tamanho está sem estoque no momento.
            </p>
          )}

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center rounded-xl border border-neutral-300">
              <button
                type="button"
                onClick={() => handleQuantityChange(item.quantidade - 1)}
                className="flex h-9 w-9 items-center justify-center text-neutral-600 hover:bg-neutral-50"
                aria-label="Diminuir quantidade"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="min-w-8 text-center text-sm font-semibold text-neutral-900">
                {item.quantidade}
              </span>
              <button
                type="button"
                onClick={() => handleQuantityChange(item.quantidade + 1)}
                disabled={item.estoque !== undefined && item.quantidade >= item.estoque}
                className="flex h-9 w-9 items-center justify-center text-neutral-600 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Aumentar quantidade"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <p className="text-sm text-neutral-700">
              Subtotal:{" "}
              <span className="font-semibold text-neutral-900">{formatCurrency(subtotal)}</span>
            </p>
          </div>

          {error && (
            <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={() => onRemove(item.productId, item.tamanho)}
            className="mt-3 text-sm font-medium text-red-600 hover:text-red-700 sm:hidden"
          >
            Remover
          </button>
        </div>
      </div>
    </article>
  );
}
