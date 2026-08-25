import { Link, useNavigate } from "@tanstack/react-router";
import { ExternalLink, Loader2, Save } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminProductSelectionCard } from "@/components/admin/AdminProductSelectionCard";
import {
  ProductCollectionFilters,
  type ProductCollectionFilterValues,
} from "@/components/admin/ProductCollectionFilters";
import { useAuth } from "@/contexts/AuthContext";
import { getToken } from "@/lib/auth";
import {
  ApiError,
  getAdminProductCollection,
  updateAdminProductCollection,
  type ProductCollectionItem,
} from "@/lib/api";
import { isTokenExpired } from "@/utils/authToken";

type CollectionType = "promotions" | "launches";

type Props = {
  collectionType: CollectionType;
  title: string;
  description: string;
  publicPath: "/promocoes" | "/lancamentos";
};

const DEFAULT_FILTERS: ProductCollectionFilterValues = {
  search: "",
  category: "",
  selection: "all",
};

export function AdminProductCollectionManager({
  collectionType,
  title,
  description,
  publicPath,
}: Props) {
  const navigate = useNavigate();
  const { isAdmin, isAuthenticated } = useAuth();

  const [items, setItems] = useState<ProductCollectionItem[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const [initialKeys, setInitialKeys] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState<ProductCollectionFilterValues>(DEFAULT_FILTERS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isDirty = useMemo(() => {
    if (selectedKeys.size !== initialKeys.size) return true;
    for (const key of selectedKeys) {
      if (!initialKeys.has(key)) return true;
    }
    return false;
  }, [selectedKeys, initialKeys]);

  useEffect(() => {
    const token = getToken();
    if (!token || isTokenExpired(token)) {
      navigate({ to: "/login", search: { session: "expired" } });
      return;
    }
    if (!isAuthenticated) {
      navigate({ to: "/login" });
      return;
    }
    if (!isAdmin) {
      navigate({ to: "/" });
    }
  }, [isAuthenticated, isAdmin, navigate]);

  useEffect(() => {
    const handler = (event: BeforeUnloadEvent) => {
      if (!isDirty) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getAdminProductCollection(collectionType);
      setItems(data.items);
      const keys = new Set(
        data.items.filter((item) => item.selected).map((item) => item.group_key),
      );
      setSelectedKeys(keys);
      setInitialKeys(new Set(keys));
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Não foi possível carregar os produtos.",
      );
    } finally {
      setLoading(false);
    }
  }, [collectionType]);

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) return;
    void load();
  }, [isAuthenticated, isAdmin, load]);

  const categories = useMemo(
    () =>
      Array.from(new Set(items.map((item) => item.categoria).filter(Boolean))).sort((a, b) =>
        a.localeCompare(b, "pt-BR"),
      ),
    [items],
  );

  const filteredItems = useMemo(() => {
    const query = filters.search.trim().toLowerCase();
    return items.filter((item) => {
      const selected = selectedKeys.has(item.group_key);
      if (filters.selection === "selected" && !selected) return false;
      if (filters.selection === "unselected" && selected) return false;
      if (filters.category && item.categoria !== filters.category) return false;
      if (!query) return true;
      return (
        item.nome.toLowerCase().includes(query) ||
        item.clube.toLowerCase().includes(query) ||
        item.categoria.toLowerCase().includes(query) ||
        item.tipo.toLowerCase().includes(query)
      );
    });
  }, [items, filters, selectedKeys]);

  function toggleKey(groupKey: string) {
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(groupKey)) next.delete(groupKey);
      else next.add(groupKey);
      return next;
    });
    setSuccess("");
  }

  function toggleVisibleBatch(select: boolean) {
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      for (const item of filteredItems) {
        if (select) next.add(item.group_key);
        else next.delete(item.group_key);
      }
      return next;
    });
    setSuccess("");
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const data = await updateAdminProductCollection(
        collectionType,
        Array.from(selectedKeys),
      );
      setItems(data.items);
      const keys = new Set(
        data.items.filter((item) => item.selected).map((item) => item.group_key),
      );
      setSelectedKeys(keys);
      setInitialKeys(new Set(keys));
      setSuccess("Alterações salvas com sucesso.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Falha ao salvar alterações.");
    } finally {
      setSaving(false);
    }
  }

  function handleLeave(to: string) {
    if (isDirty && !window.confirm("Há alterações não salvas. Deseja sair mesmo assim?")) {
      return;
    }
    navigate({ to });
  }

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return (
    <div className="section-canvas min-h-[70vh]">
      <div className="container-page py-10 lg:py-14">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Administração</p>
            <h1 className="editorial-title mt-2 text-3xl sm:text-4xl">{title}</h1>
            <p className="mt-2 max-w-2xl text-sm text-[var(--color-muted)]">{description}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to={publicPath} className="btn-secondary">
              <ExternalLink className="h-4 w-4" />
              Visualizar página pública
            </Link>
            <button type="button" className="btn-ghost" onClick={() => handleLeave("/catalogo")}>
              Catálogo
            </button>
          </div>
        </div>

        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-medium text-[var(--color-ink)]">
            {selectedKeys.size} produto(s) selecionado(s)
            {isDirty ? " · alterações pendentes" : ""}
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => toggleVisibleBatch(true)}
              disabled={loading || filteredItems.length === 0}
            >
              Selecionar visíveis
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => toggleVisibleBatch(false)}
              disabled={loading || filteredItems.length === 0}
            >
              Limpar visíveis
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={() => void handleSave()}
              disabled={loading || saving || !isDirty}
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Salvar alterações
            </button>
          </div>
        </div>

        <ProductCollectionFilters
          values={filters}
          categories={categories}
          onChange={setFilters}
        />

        {success ? (
          <div className="alert-success mt-4" role="status">
            {success}
          </div>
        ) : null}
        {error ? (
          <div className="alert-error mt-4" role="alert">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="surface-card mt-5 flex flex-col items-center justify-center gap-3 px-6 py-16 text-[var(--color-muted)]">
            <Loader2 className="h-6 w-6 animate-spin text-[var(--color-forest)]" />
            <p className="text-sm font-medium">Carregando produtos…</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="surface-card mt-5 px-6 py-14 text-center">
            <p className="editorial-title text-2xl">Nenhum produto encontrado</p>
            <p className="mt-2 text-sm text-[var(--color-muted)]">
              Ajuste os filtros ou cadastre produtos no catálogo.
            </p>
          </div>
        ) : (
          <div className="mt-5 grid gap-3 lg:grid-cols-2">
            {filteredItems.map((item) => (
              <AdminProductSelectionCard
                key={item.group_key}
                item={item}
                checked={selectedKeys.has(item.group_key)}
                onToggle={toggleKey}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
