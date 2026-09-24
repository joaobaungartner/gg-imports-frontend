import { createFileRoute, Link } from "@tanstack/react-router";
import { Loader2, PackagePlus, Search, Shirt, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CatalogProductCard } from "@/components/CatalogProductCard";
import { ProductDetailsModal } from "@/components/products/ProductDetailsModal";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import {
  deactivateManyProducts,
  deactivateProduct,
  deleteManyProducts,
  invalidateApiCache,
  listCategories,
  listProducts,
} from "@/lib/api";
import { groupProductsByVariant, type CatalogProduct } from "@/lib/catalogProducts";
import { cn } from "@/lib/utils";

type CatalogoSearch = {
  created?: string;
  categoria?: string;
  produto?: number;
};

export const Route = createFileRoute("/catalogo")({
  validateSearch: (search: Record<string, unknown>): CatalogoSearch => ({
    categoria: typeof search.categoria === "string" ? search.categoria : undefined,
    produto: Number.isInteger(Number(search.produto)) && Number(search.produto) > 0 ? Number(search.produto) : undefined,
    created: typeof search.created === "string" ? search.created : undefined,
  }),
  component: CatalogoPage,
});

function CatalogoPage() {
  const { isAdmin } = useAuth();
  const { addToCart } = useCart();
  const { created, categoria, produto } = Route.useSearch();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [banner, setBanner] = useState("");
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<CatalogProduct | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>(categoria ?? "all");

  const [statusFilter, setStatusFilter] = useState("all");

  const loadCatalog = useCallback(async (): Promise<CatalogProduct[]> => {
    setLoading(true);
    setError("");

    try {
      const [apiProducts, categories] = await Promise.all([
        listProducts(isAdmin ? null : true),
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
  }, [isAdmin]);

  useEffect(() => {
    loadCatalog();
  }, [loadCatalog]);

  useEffect(() => {
    if (created === "success") {
      setBanner("Produto cadastrado com sucesso e já disponível no catálogo.");
    }
  }, [created]);

  useEffect(() => {
    setSelectedCategory(categoria ?? "all");
  }, [categoria]);

  useEffect(() => {
    if (!produto) return;
    const match = products.find((item) => item.variantes.some((variant) => variant.id === produto));
    if (match) {
      setSelectedProduct(match);
      setIsModalOpen(true);
    }
  }, [produto, products]);

  const categories = useMemo(() => {
    const unique = Array.from(
      new Set(products.map((product) => product.categoria).filter(Boolean)),
    ).sort((a, b) => a.localeCompare(b, "pt-BR"));
    return unique;
  }, [products]);

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return products.filter((product) => {
      const active = product.variantes.some((variant) => variant.ativo);
      if (!isAdmin && !active) return false;
      if (isAdmin && statusFilter === "active" && !active) return false;
      if (isAdmin && statusFilter === "inactive" && active) return false;
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
  }, [products, searchQuery, selectedCategory, isAdmin, statusFilter]);

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
    invalidateApiCache("/products/");
    setBanner("Produto desativado com sucesso.");
    await loadCatalog();
  }

  async function handleDeactivateSize(productId: number) {
    const current = selectedProduct;
    await deactivateProduct(productId);
    invalidateApiCache("/products/");
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
    invalidateApiCache("/products/");
    setBanner("Produto excluído com sucesso.");
    await loadCatalog();
  }

  return (
    <div className="section-canvas min-h-[70vh]">
      <div className="container-page py-12 lg:py-16">
        <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="eyebrow">GG Imports / Catálogo</p>
            <h1 className="editorial-title mt-3 text-4xl sm:text-5xl">
              ENCONTRE SEU MANTO.
            </h1>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-[var(--color-muted)] sm:text-base">
              Seu clube, sua seleção, sua próxima camisa.
            </p>
          </div>

          {isAdmin && (
              <Link to="/admin/cadastrar-produto" className="btn-primary shrink-0">
                <PackagePlus className="h-4 w-4" />
                Cadastrar produto
              </Link>
          )}
        </div>

        {banner && (
          <div className="alert-success mb-6" role="status">
            {banner}
          </div>
        )}

        {!loading && !error && products.length > 0 && (
          <div className="mb-8 space-y-4">
            {isAdmin && (
              <div className="flex flex-wrap items-center gap-3">
                <label htmlFor="catalog-status" className="text-sm font-medium">Status do produto</label>
                <select id="catalog-status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="field-input max-w-xs">
                  <option value="all">Todos — ativos e inativos</option>
                  <option value="active">Ativos</option>
                  <option value="inactive">Inativos</option>
                </select>
                <p className="text-xs text-[var(--color-muted)]">Produtos inativos aparecem apenas na visão administrativa.</p>
              </div>
            )}
            <div className="relative max-w-xl">
              <label htmlFor="catalog-search" className="field-label">
                Buscar no catálogo
              </label>
              <div className="catalog-search-field">
                <Search size={20} className="catalog-search-icon" aria-hidden="true" />
                <input
                  id="catalog-search"
                  ref={searchInputRef}
                  aria-describedby="catalog-search-hint"
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Busque sua camisa ou seu time"
                  className="catalog-search-input"
                />
                {searchQuery && (
                  <button
                    type="button"
                    className="catalog-search-clear"
                    aria-label="Limpar busca"
                    onClick={() => {
                      setSearchQuery("");
                      searchInputRef.current?.focus();
                    }}
                  >
                    <X size={18} aria-hidden="true" />
                  </button>
                )}
              </div>
              <p id="catalog-search-hint" className="mt-2 text-xs text-[var(--color-muted)]">
                Busque por nome, clube, categoria ou tipo. Os resultados aparecem ao digitar.
              </p>
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
                setStatusFilter("all");
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
