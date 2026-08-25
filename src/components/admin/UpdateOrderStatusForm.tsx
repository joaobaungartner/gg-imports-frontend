import { useMemo, useState, type FormEvent } from "react";
import {
  formatOrderStatus,
  isCriticalStatusTransition,
  ORDER_STATUS_OPTIONS,
} from "@/lib/orderFormat";

type Props = {
  currentStatus: string;
  shippingMethod: string | null;
  allowedTransitions: string[];
  saving: boolean;
  onSubmit: (payload: { status: string; note?: string; force?: boolean }) => Promise<void>;
};

export function UpdateOrderStatusForm({
  currentStatus,
  shippingMethod,
  allowedTransitions,
  saving,
  onSubmit,
}: Props) {
  const [status, setStatus] = useState("");
  const [note, setNote] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState("");

  const isRetirada = (shippingMethod || "").toUpperCase() === "RETIRADA";

  const options = useMemo(() => {
    const forceTargets =
      currentStatus === "DELIVERED" || currentStatus === "CANCELED"
        ? ORDER_STATUS_OPTIONS.map((o) => o.value).filter((v) => v !== currentStatus)
        : allowedTransitions;

    return ORDER_STATUS_OPTIONS.filter((opt) => {
      if (opt.value === currentStatus) return false;
      if (opt.value === "SHIPPED" && isRetirada) return false;
      if (opt.value === "READY_FOR_PICKUP" && !isRetirada) return false;
      return forceTargets.includes(opt.value);
    });
  }, [allowedTransitions, currentStatus, isRetirada]);

  async function submit(force = false) {
    setError("");
    if (!status) {
      setError("Selecione o novo status.");
      return;
    }

    try {
      await onSubmit({
        status,
        note: note.trim() || undefined,
        force,
      });
      setStatus("");
      setNote("");
      setConfirmOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao atualizar status.");
      setConfirmOpen(false);
    }
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!status) {
      setError("Selecione o novo status.");
      return;
    }
    if (isCriticalStatusTransition(currentStatus, status)) {
      setConfirmOpen(true);
      return;
    }
    void submit(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="new-status" className="field-label">
          Novo status
        </label>
        <select
          id="new-status"
          className="field-input"
          value={status}
          disabled={saving}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">Selecione…</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-[var(--color-muted)]">
          Status atual: {formatOrderStatus(currentStatus)}
        </p>
      </div>

      <div>
        <label htmlFor="status-note" className="field-label">
          Observação da alteração (opcional)
        </label>
        <textarea
          id="status-note"
          className="field-input min-h-24"
          value={note}
          disabled={saving}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Ex.: Pacote postado nos Correios"
        />
      </div>

      {error ? (
        <div className="alert-error" role="alert">
          {error}
        </div>
      ) : null}

      <button type="submit" className="btn-primary" disabled={saving || !status}>
        {saving ? "Atualizando…" : "Atualizar status"}
      </button>

      {confirmOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="surface-card max-w-md p-6">
            <h3 className="editorial-title text-xl">Confirmar alteração</h3>
            <p className="mt-3 text-sm text-[var(--color-muted)]">
              Você está alterando um pedido em status crítico (
              {formatOrderStatus(currentStatus)} → {formatOrderStatus(status)}). Deseja continuar?
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                className="btn-primary"
                disabled={saving}
                onClick={() => void submit(true)}
              >
                Confirmar
              </button>
              <button
                type="button"
                className="btn-secondary"
                disabled={saving}
                onClick={() => setConfirmOpen(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </form>
  );
}
