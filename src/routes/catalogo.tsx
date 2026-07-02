import { createFileRoute, Link } from "@tanstack/react-router";
import { Loader2, PackagePlus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
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

type CatalogoSearch = {
  created?: string;
};

export const Route = createFileRoute("/catalogo")({
  validateSearch: (search: Record<string, unknown>): CatalogoSearch => ({
    created: typeof search.created === "string" ? search.created : undefined,
  }),
  component: CatalogoPage,
});

function CatalogoPage() {
  const { isAdmin } = useAuth();
  const { addToCart } = useCart();
  const { created } = Route.useSearch();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [banner, setBanner] = useState("");
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<CatalogProduct | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadCatalog = useCallback(async (): Promise<CatalogProduct[]> => {
    setLoading(true);
    setError("");

    try {
      const [apiProducts, categories] = await Promise.all([
        listProducts(true),
        listCategories(),
      ]);

      const categoryNames = Object.fromEntries(
        categories.map((category) => [category.id, category.nome]),
      );

      const grouped = groupProductsByVariant(apiProducts, categoryNames);
      setProducts(grouped);
      return grouped;
    } catch {
      setError("Não foi possível carregar o catálogo. Tente novamente.");
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCatalog();
  }, [loadCatalog]);

  useEffect(() => {
    if (created === "success") {
      setBanner("Produto cadastrado com sucesso e já disponível no catálogo.");
    }
  }, [created]);

  function openProductModal(product: CatalogProduct) {
    setSelectedProduct(product);
    setIsModalOpen(true);
  }

  function closeProductModal() {
    setIsModalOpen(false);
    setSelectedProduct(null);
  }

  async function handleDeactivateProduct(productIds: number[]) {
    await deactivateManyProducts(productIds);
    setBanner("Produto desativado com sucesso.");
    await loadCatalog();
  }

  async function handleDeactivateSize(productId: number) {
    const current = selectedProduct;
    await deactivateProduct(productId);
    setBanner("Tamanho desativado com sucesso.");

    const catalog = await loadCatalog();
    if (!current) return;

    const updated = catalog.find(
      (item) =>
        item.nome === current.nome &&
        item.clube === current.clube &&
        item.categoria === current.categoria &&
        item.tipo === current.tipo &&
        item.preco === current.preco &&
        item.imagem_url === current.imagem_url,
    );

    if (!updated) {
      closeProductModal();
      return;
    }

    setSelectedProduct(updated);
  }

  async function handleDeleteProduct(productIds: number[]) {
    await deleteManyProducts(productIds);
    setBanner("Produto excluído com sucesso.");
    await loadCatalog();
  }

  return (
    <div className="container-page py-12">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-neutral-900">Catálogo</h1>
          <p className="mt-2 text-neutral-600">
            Confira as camisas disponíveis e escolha o modelo ideal para você.
          </p>
        </div>

        {isAdmin && (
          <Link
            to="/admin/cadastrar-produto"
            className="inline-flex shrink-0 items-center gap-2 rounded-full border border-[var(--color-gold)]/40 bg-[var(--color-gold)]/10 px-5 py-2.5 text-sm font-semibold text-[var(--color-brand-dark)] transition-colors hover:bg-[var(--color-gold)]/20"
          >
            <PackagePlus className="h-4 w-4" />
            Cadastrar Produto
          </Link>
        )}
      </div>

      {banner && (
        <div className="mb-6 rounded-2xl border border-[var(--color-brand-green)]/20 bg-[var(--color-brand-green)]/5 px-5 py-4 text-sm text-[var(--color-brand-green)]">
          {banner}
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center gap-2 py-20 text-neutral-600">
          <Loader2 className="h-5 w-5 animate-spin" />
          Carregando catálogo...
        </div>
      )}

      {error && !loading && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {!loading && !error && products.length === 0 && (
        <div className="rounded-2xl border border-neutral-200 bg-white px-6 py-16 text-center shadow-soft">
          <p className="font-display text-lg font-semibold text-neutral-900">Nenhum produto disponível</p>
          <p className="mt-2 text-sm text-neutral-600">
            O catálogo ainda não possui produtos ativos cadastrados.
          </p>
        </div>
      )}

      {!loading && !error && products.length > 0 && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <CatalogProductCard
              key={`${product.id}-${product.nome}`}
              product={product}
              onClick={openProductModal}
            />
          ))}
        </div>
      )}

      <ProductDetailsModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={closeProductModal}
        isAdmin={isAdmin}
        onAddToCart={addToCart}
        onDeactivateProduct={handleDeactivateProduct}
        onDeactivateSize={handleDeactivateSize}
        onDeleteProduct={handleDeleteProduct}
      />
    </div>
  );
}
