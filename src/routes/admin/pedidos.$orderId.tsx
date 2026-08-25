import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { AdminOrderDetails } from "@/components/admin/AdminOrderDetails";
import { useAuth } from "@/contexts/AuthContext";
import { getToken } from "@/lib/auth";
import {
  ApiError,
  getAdminOrderById,
  updateAdminOrderNotes,
  updateAdminOrderStatus,
  type AdminOrderDetail,
} from "@/lib/api";
import { isTokenExpired } from "@/utils/authToken";

export const Route = createFileRoute("/admin/pedidos/$orderId")({
  component: AdminPedidoDetalhePage,
});

function AdminPedidoDetalhePage() {
  const { orderId } = Route.useParams();
  const numericId = Number(orderId);
  const navigate = useNavigate();
  const { isAdmin, isAuthenticated } = useAuth();

  const [order, setOrder] = useState<AdminOrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingStatus, setSavingStatus] = useState(false);
  const [savingNotes, setSavingNotes] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

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

  const loadOrder = useCallback(async () => {
    if (!Number.isFinite(numericId)) {
      setError("Pedido inválido.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const data = await getAdminOrderById(numericId);
      setOrder(data);
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setError("Pedido não encontrado.");
      } else if (err instanceof ApiError && err.status === 403) {
        setError("Acesso negado.");
      } else {
        setError(
          err instanceof ApiError ? err.message : "Não foi possível carregar o pedido.",
        );
      }
      setOrder(null);
    } finally {
      setLoading(false);
    }
  }, [numericId]);

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) return;
    void loadOrder();
  }, [isAuthenticated, isAdmin, loadOrder]);

  async function handleUpdateStatus(payload: {
    status: string;
    note?: string;
    force?: boolean;
  }) {
    setSavingStatus(true);
    setSuccessMessage("");
    try {
      const updated = await updateAdminOrderStatus(numericId, payload);
      setOrder(updated);
      setSuccessMessage("Status atualizado com sucesso.");
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Falha ao atualizar status.";
      const error = new Error(message);
      throw error;
    } finally {
      setSavingStatus(false);
    }
  }

  async function handleSaveNotes(admin_notes: string | null) {
    setSavingNotes(true);
    setSuccessMessage("");
    try {
      const updated = await updateAdminOrderNotes(numericId, admin_notes);
      setOrder(updated);
      setSuccessMessage("Observações salvas.");
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Não foi possível salvar as observações.",
      );
    } finally {
      setSavingNotes(false);
    }
  }

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return (
    <div className="section-canvas min-h-[70vh]">
      <div className="container-page py-10 lg:py-14">
        <Link to="/admin/pedidos" className="btn-ghost mb-6 inline-flex !px-0">
          <ArrowLeft className="h-4 w-4" />
          Voltar para pedidos
        </Link>

        {loading ? (
          <div className="surface-card flex flex-col items-center justify-center gap-3 px-6 py-16 text-[var(--color-muted)]">
            <Loader2 className="h-6 w-6 animate-spin text-[var(--color-forest)]" />
            <p className="text-sm font-medium">Carregando detalhes…</p>
          </div>
        ) : error && !order ? (
          <div className="surface-card px-6 py-14 text-center">
            <p className="editorial-title text-2xl">{error}</p>
            <button type="button" className="btn-primary mt-6" onClick={() => void loadOrder()}>
              Tentar novamente
            </button>
          </div>
        ) : order ? (
          <AdminOrderDetails
            order={order}
            savingStatus={savingStatus}
            savingNotes={savingNotes}
            successMessage={successMessage}
            onUpdateStatus={handleUpdateStatus}
            onSaveNotes={handleSaveNotes}
          />
        ) : null}
      </div>
    </div>
  );
}
