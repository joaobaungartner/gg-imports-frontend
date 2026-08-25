import type { AdminOrderSummary } from "@/lib/api";

type Props = {
  summary: AdminOrderSummary | null;
  loading?: boolean;
};

const CARDS: { key: keyof AdminOrderSummary; label: string }[] = [
  { key: "total", label: "Total de pedidos" },
  { key: "pending_payment", label: "Aguardando pagamento" },
  { key: "preparing", label: "Em preparação" },
  { key: "shipped_or_ready", label: "Enviados / retirada" },
  { key: "delivered", label: "Concluídos" },
  { key: "canceled", label: "Cancelados" },
];

export function AdminOrderSummaryCards({ summary, loading }: Props) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {CARDS.map((card) => (
        <div key={card.key} className="surface-card px-4 py-4">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
            {card.label}
          </p>
          <p className="editorial-title mt-2 text-2xl">
            {loading || !summary ? "—" : summary[card.key]}
          </p>
        </div>
      ))}
    </div>
  );
}
