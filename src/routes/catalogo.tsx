import { createFileRoute, Link } from "@tanstack/react-router";
import { Loader2, PackagePlus } from "lucide-react";
import { useEffect, useState } from "react";
import { CatalogProductCard } from "@/components/CatalogProductCard";
import { useAuth } from "@/contexts/AuthContext";
import { groupProductsByVariant } from "@/lib/catalogProducts";
import { listCategories, listProducts } from "@/lib/api";

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
  const { created } = Route.useSearch();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [products, setProducts] = useState<ReturnType<typeof groupProductsByVariant>>([]);

  useEffect(() => {
    let cancelled = false;

    async function loadCatalog() {
      setLoading(true);
      setError("");

      try {
        const [apiProducts, categories] = await Promise.all([
          listProducts(true),
          listCategories(),
        ]);

        if (cancelled) return;

        const categoryNames = Object.fromEntries(
          categories.map((category) => [category.id, category.nome]),
        );

        setProducts(groupProductsByVariant(apiProducts, categoryNames));
      } catch {
        if (!cancelled) {
          setError("Não foi possível carregar o catálogo. Tente novamente.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadCatalog();

    return () => {
      cancelled = true;
    };
  }, []);

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

      {created === "success" && (
        <div className="mb-6 rounded-2xl border border-[var(--color-brand-green)]/20 bg-[var(--color-brand-green)]/5 px-5 py-4 text-sm text-[var(--color-brand-green)]">
          Produto cadastrado com sucesso e já disponível no catálogo.
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
            <CatalogProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
