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
      className="group flex flex-col overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-elevated"
    >
      <div
        className="relative flex aspect-[4/5] items-center justify-center overflow-hidden"
        style={{
          background: `linear-gradient(145deg, ${product.imageColor}22 0%, ${product.imageColor}55 50%, ${product.imageColor}88 100%)`,
        }}
      >
        <div
          className="relative h-[72%] w-[58%] rounded-t-3xl rounded-b-lg shadow-elevated transition-transform duration-300 group-hover:scale-105"
          style={{ backgroundColor: product.imageColor }}
        >
          <div className="absolute inset-x-0 top-[18%] mx-auto h-3 w-[55%] rounded-full bg-black/15" />
          <div className="absolute inset-x-0 top-[32%] flex justify-center gap-1">
            {[0, 1, 2, 3, 4].map((i) => (
              <span key={i} className="h-5 w-0.5 rounded-full bg-white/25" />
            ))}
          </div>
        </div>

        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {product.isNew && (
            <span className="rounded-full bg-[var(--color-brand-green)] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
              Novo
            </span>
          )}
          {product.onSale && (
            <span className="rounded-full bg-[var(--color-gold)] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-brand-dark)]">
              Promo
            </span>
          )}
        </div>

        {!product.inStock && (
          <span className="absolute bottom-3 rounded-full bg-neutral-900/80 px-3 py-1 text-xs text-white">
            Sob encomenda
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">{product.club}</p>
        <h3 className="font-display line-clamp-2 text-sm font-semibold leading-snug text-neutral-900 sm:text-base">
          {product.name}
        </h3>
        <p className="text-xs text-neutral-500">{product.category}</p>

        <div className="mt-auto flex items-end justify-between gap-2 pt-2">
          <div className="flex flex-col">
            {product.originalPrice && (
              <span className="text-xs text-neutral-400 line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
            <span
              className={cn(
                "font-display text-lg font-bold",
                product.onSale ? "text-gold" : "text-neutral-900",
              )}
            >
              {formatPrice(product.price)}
            </span>
          </div>
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100 text-neutral-700 transition-colors group-hover:bg-[var(--color-brand-green)] group-hover:text-white">
            <ShoppingBag className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}
