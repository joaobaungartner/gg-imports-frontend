import { Shirt } from "lucide-react";
import { formatPrice } from "@/data/products";
import type { CatalogProduct } from "@/lib/catalogProducts";

type CatalogProductCardProps = {
  product: CatalogProduct;
  onClick: (product: CatalogProduct) => void;
};

export function CatalogProductCard({ product, onClick }: CatalogProductCardProps) {
  return (
    <button
      type="button"
      onClick={() => onClick(product)}
      className="group surface-card flex w-full flex-col overflow-hidden text-left transition-transform duration-300 hover:-translate-y-0.5"
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-[var(--color-cream)]">
        {product.imagem_url ? (
          <img
            src={product.imagem_url}
            alt={product.nome}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-[var(--color-muted)]">
            <Shirt className="h-12 w-12" />
            <span className="text-xs font-medium">Sem imagem</span>
          </div>
        )}

        <div className="absolute inset-0 flex items-center justify-center bg-[var(--color-forest)]/0 opacity-0 transition-all duration-300 group-hover:bg-[var(--color-forest)]/45 group-hover:opacity-100">
          <span className="border border-white/70 bg-white/10 px-4 py-2 text-xs font-semibold tracking-[0.12em] text-white uppercase backdrop-blur-sm">
            Ver detalhes
          </span>
        </div>

        <span
          className={
            product.inStock
              ? "tag-lime absolute top-3 left-3"
              : "absolute top-3 left-3 inline-flex items-center rounded-full bg-[var(--color-ink)]/80 px-2.5 py-0.5 text-[0.65rem] font-bold tracking-[0.06em] text-white uppercase"
          }
        >
          {product.inStock ? "Pronta entrega" : "Sob encomenda"}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-[0.65rem] font-semibold tracking-[0.14em] text-[var(--color-muted)] uppercase">
          {product.categoria}
        </p>
        <h3 className="line-clamp-2 text-sm leading-snug font-semibold text-[var(--color-ink)] sm:text-base">
          {product.nome}
        </h3>
        <p className="text-xs text-[var(--color-muted)]">{product.clube}</p>
        <p className="font-display text-lg font-bold text-[var(--color-forest)]">
          {formatPrice(product.preco)}
        </p>
        <p className="text-xs text-[var(--color-muted)]">
          Tamanhos:{" "}
          <span className="font-medium text-[var(--color-ink)]">{product.tamanhos.join(", ")}</span>
        </p>

        <span className="btn-primary mt-auto w-full px-3 py-2.5 text-xs">Escolher tamanho</span>
      </div>
    </button>
  );
}
