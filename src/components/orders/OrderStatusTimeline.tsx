import { formatOrderDateTime } from "@/lib/orderFormat";
import type { OrderStatusHistoryItem, OrderTimelineItem } from "@/lib/api";
import { cn } from "@/lib/utils";

type CustomerProps = {
  variant: "customer";
  items: OrderTimelineItem[];
};

type AdminProps = {
  variant: "admin";
  items: OrderStatusHistoryItem[];
};

type OrderStatusTimelineProps = CustomerProps | AdminProps;

export function OrderStatusTimeline(props: OrderStatusTimelineProps) {
  const isEmpty =
    props.variant === "customer" ? props.items.length === 0 : props.items.length === 0;

  if (isEmpty) {
    return (
      <p className="text-sm text-[var(--color-muted)]">
        Ainda não há histórico de status para este pedido.
      </p>
    );
  }

  return (
    <ol className="relative space-y-0 border-l border-[var(--color-line)] pl-5">
      {props.variant === "customer"
        ? props.items.map((item, index) => (
            <li key={`${item.status}-${item.created_at}-${index}`} className="relative pb-6 last:pb-0">
              <span
                className={cn(
                  "absolute -left-[1.4rem] top-1 h-2.5 w-2.5 rounded-full border-2 border-[var(--color-canvas)]",
                  index === 0 ? "bg-[var(--color-forest)]" : "bg-[var(--color-line)]",
                )}
              />
              <p className="text-sm font-semibold text-[var(--color-ink)]">{item.message}</p>
              <p className="mt-0.5 text-xs text-[var(--color-muted)]">{item.label}</p>
              <p className="mt-1 text-xs text-[var(--color-muted)]">
                {formatOrderDateTime(item.created_at)}
              </p>
            </li>
          ))
        : props.items.map((item) => (
            <li key={item.id} className="relative pb-6 last:pb-0">
              <span className="absolute -left-[1.4rem] top-1 h-2.5 w-2.5 rounded-full bg-[var(--color-forest)]" />
              <p className="text-sm font-semibold text-[var(--color-ink)]">
                {item.new_status}
              </p>
              <p className="mt-1 text-xs text-[var(--color-muted)]">
                {formatOrderDateTime(item.created_at)}
                {item.changed_by_name ? ` · ${item.changed_by_name}` : ""}
              </p>
              {item.note ? (
                <p className="mt-2 text-sm text-[var(--color-ink)]">{item.note}</p>
              ) : null}
            </li>
          ))}
    </ol>
  );
}
