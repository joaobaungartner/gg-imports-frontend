import { formatOrderStatus, getOrderStatusColor } from "@/lib/orderFormat";
import { cn } from "@/lib/utils";

type OrderStatusBadgeProps = {
  status: string;
  className?: string;
};

export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-[4px] border px-2.5 py-1 text-xs font-semibold",
        getOrderStatusColor(status),
        className,
      )}
    >
      {formatOrderStatus(status)}
    </span>
  );
}
