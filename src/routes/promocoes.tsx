import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { products } from "@/data/products";

export const Route = createFileRoute("/promocoes")({
  component: PromocoesPage,
});

function PromocoesPage() {
  const items = products.filter((product) => product.onSale);

  return (
    <div className="section-canvas min-h-[70vh]">
      <div className="container-page py-12 lg:py-16">
        <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-xl">
            <p className="eyebrow">Oportunidade</p>
            <h1 className="editorial-title mt-3 text-3xl sm:text-5xl">
              Promoções e <span className="editorial-serif">ofertas</span>
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-[var(--color-muted)] sm:text-base">
              Seleção com preço especial. Quantidades limitadas — aproveite enquanto estiver
              disponível.
            </p>
          </div>
          <Link to="/catalogo" className="btn-secondary shrink-0">
            Ver catálogo completo
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {items.length === 0 ? (
          <div className="surface-card px-6 py-14 text-center">
            <p className="editorial-title text-2xl">Nenhuma promoção ativa</p>
            <p className="mx-auto mt-2 max-w-md text-sm text-[var(--color-muted)]">
              Volte em breve ou explore o catálogo completo da GG Imports.
            </p>
            <Link to="/catalogo" className="btn-primary mt-6 inline-flex">
              Ir ao catálogo
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 min-[480px]:grid-cols-2 lg:grid-cols-3">
            {items.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
