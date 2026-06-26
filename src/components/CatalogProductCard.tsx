import { Link } from "@tanstack/react-router";
import { Shirt, ShoppingBag } from "lucide-react";
import { formatPrice } from "@/data/products";
import type { CatalogProduct } from "@/lib/catalogProducts";

type CatalogProductCardProps = {
  product: CatalogProduct;
};

export function CatalogProductCard({ product }: CatalogProductCardProps) {
  return (
    <Link
      to="/produto/$id"
      params={{ id: String(product.id) }}
      className="group flex flex-col overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-elevated"
    >
      <div className="relative flex aspect-[4/5] items-center justify-center overflow-hidden bg-neutral-100">
        {product.imagem_url ? (
          <img
            src={product.imagem_url}
            alt={product.nome}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-neutral-100 to-neutral-200 text-neutral-400">
            <Shirt className="h-12 w-12" />
            <span className="text-xs font-medium">Sem imagem</span>
          </div>
        )}

        {!product.inStock && (
          <span className="absolute bottom-3 rounded-full bg-neutral-900/80 px-3 py-1 text-xs text-white">
            Sob encomenda
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">{product.clube}</p>
        <h3 className="font-display line-clamp-2 text-sm font-semibold leading-snug text-neutral-900 sm:text-base">
          {product.nome}
        </h3>
        <p className="text-xs text-neutral-500">
          {product.categoria} · {product.tipo}
        </p>
        <p className="text-xs text-neutral-600">
          Tamanhos: <span className="font-medium text-neutral-800">{product.tamanhos.join(", ")}</span>
        </p>

        <div className="mt-auto flex items-end justify-between gap-2 pt-2">
          <span className="font-display text-lg font-bold text-neutral-900">
            {formatPrice(product.preco)}
          </span>
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100 text-neutral-700 transition-colors group-hover:bg-[var(--color-brand-green)] group-hover:text-white">
            <ShoppingBag className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}
