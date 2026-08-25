import { Shirt } from "lucide-react";
import type { ProductCollectionItem } from "@/lib/api";
import { formatCurrency } from "@/lib/formatCurrency";
import { cn } from "@/lib/utils";

type Props = {
  item: ProductCollectionItem;
  checked: boolean;
  onToggle: (groupKey: string) => void;
};

export function AdminProductSelectionCard({ item, checked, onToggle }: Props) {
  return (
    <label
      className={cn(
        "surface-card flex cursor-pointer gap-3 p-3 transition-colors",
        checked ? "border-[var(--color-forest)]/40 bg-[var(--color-cream)]" : "",
      )}
    >
      <input
        type="checkbox"
        className="mt-1 h-4 w-4 accent-[var(--color-forest)]"
        checked={checked}
        onChange={() => onToggle(item.group_key)}
      />
      <div className="h-20 w-16 shrink-0 overflow-hidden rounded-[4px] bg-[var(--color-cream)]">
        {item.imagem_url ? (
          <img
            src={item.imagem_url}
            alt={item.nome}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[var(--color-muted)]">
            <Shirt className="h-6 w-6" />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="font-medium text-[var(--color-ink)]">{item.nome}</p>
            <p className="text-xs text-[var(--color-muted)]">
              {item.clube} · {item.categoria} · {item.tipo}
            </p>
          </div>
          <span
            className={cn(
              "rounded-[4px] border px-2 py-0.5 text-[10px] font-semibold uppercase",
              item.ativo
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-red-200 bg-red-50 text-red-800",
            )}
          >
            {item.ativo ? "Ativo" : "Inativo"}
          </span>
        </div>
        <div className="mt-2 flex flex-wrap gap-3 text-sm">
          <span className="font-semibold text-[var(--color-forest)]">
            {formatCurrency(Number(item.preco))}
          </span>
          <span className="text-[var(--color-muted)]">
            Estoque total: {item.estoque_total}
          </span>
        </div>
      </div>
    </label>
  );
}
