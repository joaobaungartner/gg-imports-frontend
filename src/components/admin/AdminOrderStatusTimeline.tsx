import { formatOrderStatus } from "@/lib/orderFormat";
import type { OrderStatusHistoryItem } from "@/lib/api";
import { formatOrderDateTime } from "@/lib/orderFormat";

type Props = {
  items: OrderStatusHistoryItem[];
};

export function AdminOrderStatusTimeline({ items }: Props) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-[var(--color-muted)]">
        Ainda não há histórico de alterações.
      </p>
    );
  }

  return (
    <ol className="relative space-y-0 border-l border-[var(--color-line)] pl-5">
      {items.map((item, index) => (
        <li key={item.id} className="relative pb-6 last:pb-0">
          <span
            className={`absolute -left-[1.4rem] top-1 h-2.5 w-2.5 rounded-full ${
              index === 0 ? "bg-[var(--color-forest)]" : "bg-[var(--color-line)]"
            }`}
          />
          <p className="text-sm font-semibold text-[var(--color-ink)]">
            {formatOrderStatus(item.new_status)}
          </p>
          <p className="mt-1 text-xs text-[var(--color-muted)]">
            {formatOrderDateTime(item.created_at)}
            {item.changed_by_name ? ` · por ${item.changed_by_name}` : " · sistema"}
          </p>
          {item.previous_status ? (
            <p className="mt-1 text-xs text-[var(--color-muted)]">
              De {formatOrderStatus(item.previous_status)}
            </p>
          ) : null}
          {item.note ? (
            <p className="mt-2 rounded-[4px] bg-[var(--color-cream)] px-3 py-2 text-sm text-[var(--color-ink)]">
              {item.note}
            </p>
          ) : null}
        </li>
      ))}
    </ol>
  );
}
