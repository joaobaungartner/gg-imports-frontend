import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ClipboardList, Loader2, PackagePlus, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { AdminOrderCard } from "@/components/admin/AdminOrderCard";
import {
  AdminOrderFilters,
  type AdminOrderFilterValues,
} from "@/components/admin/AdminOrderFilters";
import { AdminOrderSummaryCards } from "@/components/admin/AdminOrderSummary";
import { AdminOrdersTable } from "@/components/admin/AdminOrdersTable";
import { Pagination } from "@/components/admin/Pagination";
import { useAuth } from "@/contexts/AuthContext";
import { getToken } from "@/lib/auth";
import {
  ApiError,
  getAdminOrdersSummary,
  listAdminOrders,
  type AdminOrderListItem,
  type AdminOrderSummary,
} from "@/lib/api";
import { isTokenExpired } from "@/utils/authToken";

export const Route = createFileRoute("/admin/pedidos")({
  component: AdminPedidosPage,
});

const DEFAULT_FILTERS: AdminOrderFilterValues = {
  search: "",
  status: "",
  shipping_method: "",
  payment_method: "",
  date_from: "",
  date_to: "",
  sort: "desc",
};

function AdminPedidosPage() {
  const navigate = useNavigate();
  const { isAdmin, isAuthenticated } = useAuth();

  const [filters, setFilters] = useState<AdminOrderFilterValues>(DEFAULT_FILTERS);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [orders, setOrders] = useState<AdminOrderListItem[]>([]);
  const [summary, setSummary] = useState<AdminOrderSummary | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
    const timer = window.setTimeout(() => {
      setDebouncedSearch(filters.search.trim());
      setPage(1);
    }, 350);
    return () => window.clearTimeout(timer);
  }, [filters.search]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [listResult, summaryResult] = await Promise.all([
        listAdminOrders({
          page,
          page_size: 20,
          status: filters.status || undefined,
          shipping_method: filters.shipping_method || undefined,
          payment_method: filters.payment_method || undefined,
          date_from: filters.date_from || undefined,
          date_to: filters.date_to || undefined,
          search: debouncedSearch || undefined,
          sort: filters.sort,
        }),
        getAdminOrdersSummary({
          date_from: filters.date_from || undefined,
          date_to: filters.date_to || undefined,
        }),
      ]);
      setOrders(listResult.items);
      setTotal(listResult.total);
      setTotalPages(listResult.total_pages);
      setSummary(summaryResult);
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        setError("Acesso negado. Apenas administradores podem gerenciar pedidos.");
      } else {
        setError(
          err instanceof ApiError ? err.message : "Não foi possível carregar os pedidos.",
        );
      }
      setOrders([]);
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }, [
    page,
    filters.status,
    filters.shipping_method,
    filters.payment_method,
    filters.date_from,
    filters.date_to,
    filters.sort,
    debouncedSearch,
  ]);

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) return;
    void loadData();
  }, [isAuthenticated, isAdmin, loadData]);

  function handleFiltersChange(next: AdminOrderFilterValues) {
    setFilters(next);
    if (
      next.status !== filters.status ||
      next.shipping_method !== filters.shipping_method ||
      next.payment_method !== filters.payment_method ||
      next.date_from !== filters.date_from ||
      next.date_to !== filters.date_to ||
      next.sort !== filters.sort
    ) {
      setPage(1);
    }
  }

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return (
    <div className="section-canvas min-h-[70vh]">
      <div className="container-page py-10 lg:py-14">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">
              <ClipboardList className="h-3.5 w-3.5" />
              Administração
            </p>
            <h1 className="editorial-title mt-2 text-3xl sm:text-4xl">
              Pedidos
            </h1>
            <p className="mt-2 max-w-xl text-sm text-[var(--color-muted)]">
              Gerencie status, acompanhe pagamentos e responda pedidos que precisam de
              atenção.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to="/admin/cadastrar-produto" className="btn-secondary">
              <PackagePlus className="h-4 w-4" />
              Cadastrar produto
            </Link>
            <Link to="/catalogo" className="btn-ghost">
              Produtos
            </Link>
          </div>
        </div>

        <div className="space-y-5">
          <AdminOrderSummaryCards summary={summary} loading={loading} />

          <AdminOrderFilters
            values={filters}
            onChange={handleFiltersChange}
            onClear={() => {
              setFilters(DEFAULT_FILTERS);
              setDebouncedSearch("");
              setPage(1);
            }}
            disabled={loading}
          />

          {error ? (
            <div className="alert-error flex flex-wrap items-center justify-between gap-3" role="alert">
              <span>{error}</span>
              <button type="button" className="btn-secondary" onClick={() => void loadData()}>
                <RefreshCw className="h-4 w-4" />
                Tentar novamente
              </button>
            </div>
          ) : null}

          {loading ? (
            <div className="surface-card flex flex-col items-center justify-center gap-3 px-6 py-16 text-[var(--color-muted)]">
              <Loader2 className="h-6 w-6 animate-spin text-[var(--color-forest)]" />
              <p className="text-sm font-medium">Carregando pedidos…</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="surface-card px-6 py-14 text-center">
              <p className="editorial-title text-2xl">Nenhum pedido encontrado</p>
              <p className="mx-auto mt-2 max-w-md text-sm text-[var(--color-muted)]">
                Ajuste os filtros ou aguarde novos pedidos no sistema.
              </p>
            </div>
          ) : (
            <>
              <p className="text-sm text-[var(--color-muted)]">{total} pedido(s)</p>
              <AdminOrdersTable orders={orders} />
              <div className="space-y-3 lg:hidden">
                {orders.map((order) => (
                  <AdminOrderCard key={order.id} order={order} />
                ))}
              </div>
              <Pagination
                page={page}
                totalPages={totalPages}
                onChange={setPage}
                disabled={loading}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
