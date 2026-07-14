import { Link } from "@tanstack/react-router";
import { ShoppingBag } from "lucide-react";
import type { Product } from "@/data/products";
import { formatPrice } from "@/data/products";
import { cn } from "@/lib/utils";

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link
      to="/produto/$id"
      params={{ id: product.id }}
      className="surface-card group flex flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1"
    >
      <div
        className="relative flex aspect-[4/5] items-center justify-center overflow-hidden bg-[var(--color-cream)]"
        style={{
          background: `linear-gradient(145deg, ${product.imageColor}18 0%, ${product.imageColor}40 50%, ${product.imageColor}70 100%)`,
        }}
      >
        <div
          className="relative h-[72%] w-[58%] rounded-t-[4px] rounded-b-[4px] shadow-elevated transition-transform duration-300 group-hover:scale-105"
          style={{ backgroundColor: product.imageColor }}
        >
          <div className="absolute inset-x-0 top-[18%] mx-auto h-3 w-[55%] rounded-[4px] bg-black/15" />
          <div className="absolute inset-x-0 top-[32%] flex justify-center gap-1">
            {[0, 1, 2, 3, 4].map((i) => (
              <span key={i} className="h-5 w-0.5 rounded-full bg-white/25" />
            ))}
          </div>
        </div>

        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.isNew && <span className="tag-lime">Novo</span>}
          {product.onSale && (
            <span className="inline-flex items-center rounded-full bg-[var(--color-forest)] px-2.5 py-0.5 text-[0.65rem] font-bold tracking-[0.06em] text-white uppercase">
              Promo
            </span>
          )}
        </div>

        {!product.inStock && (
          <span className="absolute bottom-3 rounded-full bg-[var(--color-ink)]/85 px-3 py-1 text-xs text-white">
            Sob encomenda
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-[0.65rem] font-semibold tracking-[0.14em] text-[var(--color-muted)] uppercase">
          {product.club}
        </p>
        <h3 className="line-clamp-2 text-sm leading-snug font-semibold text-[var(--color-ink)] sm:text-base">
          {product.name}
        </h3>
        <p className="text-xs text-[var(--color-muted)]">{product.category}</p>

        <div className="mt-auto flex items-end justify-between gap-2 pt-2">
          <div className="flex flex-col">
            {product.originalPrice && (
              <span className="text-xs text-[var(--color-muted)] line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
            <span
              className={cn(
                "font-display text-lg font-bold",
                product.onSale ? "text-[var(--color-forest)]" : "text-[var(--color-ink)]",
              )}
            >
              {formatPrice(product.price)}
            </span>
          </div>
          <span className="flex h-9 w-9 items-center justify-center rounded-[4px] bg-[var(--color-cream)] text-[var(--color-ink)] transition-colors group-hover:bg-[var(--color-forest)] group-hover:text-white">
            <ShoppingBag className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}
