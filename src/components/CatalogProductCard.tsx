import { ArrowUpRight, Shirt } from "lucide-react";
import { formatPrice } from "@/data/products";
import type { CatalogProduct } from "@/lib/catalogProducts";

type CatalogProductCardProps = {
  product: CatalogProduct;
  onClick: (product: CatalogProduct) => void;
};

export function CatalogProductCard({ product, onClick }: CatalogProductCardProps) {
  const isActive = product.variantes.some((variant) => variant.ativo);
  return (
    <button
      type="button"
      onClick={() => onClick(product)}
      className="group catalog-card flex w-full flex-col overflow-hidden text-left transition-transform duration-300"
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-[var(--color-cream)]">
        {product.imagem_url ? (
          <img
            src={product.imagem_url}
            alt={product.nome}
            loading="lazy"
            className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
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
          {!isActive ? "Inativo" : product.inStock ? "Pronta entrega" : "Sob encomenda"}
        </span>
      </div>

      <div className="catalog-card-details flex flex-1 flex-col gap-2 py-4">
        <p className="text-xs font-semibold tracking-[0.14em] text-[var(--color-muted)] uppercase">
          {product.categoria}
        </p>
        <h3 className="line-clamp-2 text-sm leading-snug font-semibold text-[var(--color-ink)] sm:text-base">
          {product.nome}
        </h3>
        <p className="text-xs text-[var(--color-muted)]">{product.clube}</p>
        <p className="text-base font-semibold text-[var(--color-forest)]">
          {formatPrice(product.preco)}
        </p>
        <p className="text-xs text-[var(--color-muted)]">
          Tamanhos:{" "}
          <span className="font-medium text-[var(--color-ink)]">{product.tamanhos.join(", ")}</span>
        </p>

        <span className="catalog-card-action">{isActive ? "Escolher tamanho" : "Ver produto inativo"} <ArrowUpRight size={18} /></span>
      </div>
    </button>
  );
}
