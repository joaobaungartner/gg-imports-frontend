import { Link } from "@tanstack/react-router";
import { ArrowRight, Loader2 } from "lucide-react";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { CatalogProductCard } from "@/components/CatalogProductCard";
import { ProductDetailsModal } from "@/components/products/ProductDetailsModal";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import {
  deactivateManyProducts,
  deactivateProduct,
  deleteManyProducts,
  listCategories,
  listProducts,
} from "@/lib/api";
import { groupProductsByVariant, type CatalogProduct } from "@/lib/catalogProducts";

export type ShowcaseConfig = {
  collection: "promotions" | "launches";
  eyebrow: ReactNode;
  title: ReactNode;
  description: string;
  emptyTitle: string;
  emptyMessage: string;
};

type Props = {
  config: ShowcaseConfig;
};

export function PublicProductShowcase({ config }: Props) {
  const { isAdmin } = useAuth();
  const { addToCart } = useCart();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<CatalogProduct | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [apiProducts, categories] = await Promise.all([
        listProducts(true, { collection: config.collection }),
        listCategories(),
      ]);
      const categoryNames = Object.fromEntries(
        categories.map((category) => [category.id, category.nome]),
      );
      setProducts(groupProductsByVariant(apiProducts, categoryNames));
    } catch {
      setError("Não foi possível carregar os produtos. Tente novamente.");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [config.collection]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="section-canvas min-h-[70vh]">
      <div className="container-page py-12 lg:py-16">
        <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-xl">
            <p className="eyebrow">{config.eyebrow}</p>
            <h1 className="editorial-title mt-3 text-3xl sm:text-5xl">{config.title}</h1>
            <p className="mt-3 text-sm leading-relaxed text-[var(--color-muted)] sm:text-base">
              {config.description}
            </p>
          </div>
          <Link to="/catalogo" className="btn-secondary shrink-0">
            Ver catálogo completo
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {loading ? (
          <div className="surface-card flex flex-col items-center justify-center gap-3 px-6 py-16 text-[var(--color-muted)]">
            <Loader2 className="h-6 w-6 animate-spin text-[var(--color-forest)]" />
            <p className="text-sm font-medium">Carregando…</p>
          </div>
        ) : error ? (
          <div className="alert-error flex flex-wrap items-center justify-between gap-3" role="alert">
            <span>{error}</span>
            <button type="button" className="btn-secondary" onClick={() => void load()}>
              Tentar novamente
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="surface-card px-6 py-14 text-center">
            <p className="editorial-title text-2xl">{config.emptyTitle}</p>
            <p className="mx-auto mt-2 max-w-md text-sm text-[var(--color-muted)]">
              {config.emptyMessage}
            </p>
            <Link to="/catalogo" className="btn-primary mt-6 inline-flex">
              Ir ao catálogo
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 min-[480px]:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <CatalogProductCard
                key={`${product.id}-${product.nome}`}
                product={product}
                onClick={(item) => {
                  setSelectedProduct(item);
                  setIsModalOpen(true);
                }}
              />
            ))}
          </div>
        )}

        <ProductDetailsModal
          product={selectedProduct}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedProduct(null);
          }}
          isAdmin={isAdmin}
          onAddToCart={addToCart}
          onDeactivateProduct={async (ids) => {
            await deactivateManyProducts(ids);
            await load();
          }}
          onDeactivateSize={async (id) => {
            await deactivateProduct(id);
            await load();
          }}
          onDeleteProduct={async (ids) => {
            await deleteManyProducts(ids);
            await load();
          }}
        />
      </div>
    </div>
  );
}
