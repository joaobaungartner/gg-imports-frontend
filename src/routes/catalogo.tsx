import { createFileRoute, Link } from "@tanstack/react-router";
import { Loader2, PackagePlus, Search, Shirt } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
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
import { cn } from "@/lib/utils";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

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

  const categories = useMemo(() => {
    const unique = Array.from(
      new Set(products.map((product) => product.categoria).filter(Boolean)),
    ).sort((a, b) => a.localeCompare(b, "pt-BR"));
    return unique;
  }, [products]);

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return products.filter((product) => {
      const matchesCategory =
        selectedCategory === "all" || product.categoria === selectedCategory;

      if (!matchesCategory) return false;
      if (!query) return true;

      return (
        product.nome.toLowerCase().includes(query) ||
        product.clube.toLowerCase().includes(query) ||
        product.categoria.toLowerCase().includes(query) ||
        product.tipo.toLowerCase().includes(query)
      );
    });
  }, [products, searchQuery, selectedCategory]);

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
    <div className="section-canvas min-h-[70vh]">
      <div className="container-page py-12 lg:py-16">
        <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="eyebrow">Curadoria GG</p>
            <h1 className="editorial-title mt-3 text-4xl sm:text-5xl">
              Escolha o seu <span className="editorial-serif">manto</span>
            </h1>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-[var(--color-muted)] sm:text-base">
              Busque por nome, clube, categoria ou tipo e filtre o catálogo com a seleção GG Imports.
            </p>
          </div>

          {isAdmin && (
            <>
              <Link to="/admin/pedidos" className="btn-secondary shrink-0">
                Pedidos
              </Link>
              <Link to="/admin/cadastrar-produto" className="btn-primary shrink-0">
                <PackagePlus className="h-4 w-4" />
                Cadastrar produto
              </Link>
            </>
          )}
        </div>

        {banner && (
          <div className="alert-success mb-6" role="status">
            {banner}
          </div>
        )}

        {!loading && !error && products.length > 0 && (
          <div className="mb-8 space-y-4">
            <div className="relative max-w-xl">
              <label htmlFor="catalog-search" className="field-label">
                Buscar no catálogo
              </label>
              <div className="relative">
                <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[var(--color-muted)]" />
                <input
                  id="catalog-search"
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Nome, clube, categoria ou tipo..."
                  className="field-input pl-10"
                />
              </div>
            </div>

            <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:thin]">
              <button
                type="button"
                onClick={() => setSelectedCategory("all")}
                className={cn("pill shrink-0", selectedCategory === "all" && "pill-active")}
              >
                Todos
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  className={cn(
                    "pill shrink-0",
                    selectedCategory === category && "pill-active",
                  )}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        )}

        {loading && (
          <div className="surface-card flex flex-col items-center justify-center gap-3 px-6 py-20 text-[var(--color-muted)]">
            <Loader2 className="h-6 w-6 animate-spin text-[var(--color-forest)]" />
            <p className="text-sm font-medium">Carregando catálogo…</p>
          </div>
        )}

        {error && !loading && (
          <div className="alert-error" role="alert">
            {error}
          </div>
        )}

        {!loading && !error && products.length === 0 && (
          <div className="surface-card px-6 py-16 text-center">
            <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-[4px] bg-[var(--color-cream)] text-[var(--color-muted)]">
              <Shirt className="h-6 w-6" />
            </span>
            <p className="editorial-title text-2xl">Nenhum produto disponível</p>
            <p className="mx-auto mt-2 max-w-md text-sm text-[var(--color-muted)]">
              O catálogo ainda não possui produtos ativos cadastrados.
            </p>
          </div>
        )}

        {!loading && !error && products.length > 0 && filteredProducts.length === 0 && (
          <div className="surface-card px-6 py-14 text-center">
            <p className="editorial-title text-2xl">Nenhum resultado</p>
            <p className="mx-auto mt-2 max-w-md text-sm text-[var(--color-muted)]">
              Ajuste a busca ou o filtro de categoria para encontrar outros mantos.
            </p>
            <button
              type="button"
              className="btn-secondary mt-6"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
              }}
            >
              Limpar filtros
            </button>
          </div>
        )}

        {!loading && !error && filteredProducts.length > 0 && (
          <div className="grid grid-cols-1 gap-5 min-[480px]:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product) => (
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
    </div>
  );
}
