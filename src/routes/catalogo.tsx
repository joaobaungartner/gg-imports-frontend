import { createFileRoute, Link } from "@tanstack/react-router";
import { PackagePlus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export const Route = createFileRoute("/catalogo")({
  component: CatalogoPage,
});

function CatalogoPage() {
  const { isAdmin } = useAuth();

  return (
    <div className="container-page py-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Catálogo</h1>
          <p className="mt-2 text-neutral-600">Página em construção.</p>
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
    </div>
  );
}
