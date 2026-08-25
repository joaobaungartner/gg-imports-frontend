import { ORDER_STATUS_OPTIONS } from "@/lib/orderFormat";

export type AdminOrderFilterValues = {
  search: string;
  status: string;
  shipping_method: string;
  payment_method: string;
  date_from: string;
  date_to: string;
  sort: "asc" | "desc";
};

type Props = {
  values: AdminOrderFilterValues;
  onChange: (values: AdminOrderFilterValues) => void;
  onClear: () => void;
  disabled?: boolean;
};

export function AdminOrderFilters({ values, onChange, onClear, disabled }: Props) {
  function update<K extends keyof AdminOrderFilterValues>(key: K, value: AdminOrderFilterValues[K]) {
    onChange({ ...values, [key]: value });
  }

  return (
    <div className="surface-card p-4 sm:p-5">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div className="md:col-span-2">
          <label htmlFor="admin-order-search" className="field-label">
            Buscar
          </label>
          <input
            id="admin-order-search"
            value={values.search}
            onChange={(e) => update("search", e.target.value)}
            disabled={disabled}
            placeholder="Número, cliente, e-mail ou CPF"
            className="field-input"
          />
        </div>

        <div>
          <label htmlFor="admin-order-status" className="field-label">
            Status
          </label>
          <select
            id="admin-order-status"
            value={values.status}
            onChange={(e) => update("status", e.target.value)}
            disabled={disabled}
            className="field-input"
          >
            <option value="">Todos</option>
            {ORDER_STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="admin-order-shipping" className="field-label">
            Entrega / retirada
          </label>
          <select
            id="admin-order-shipping"
            value={values.shipping_method}
            onChange={(e) => update("shipping_method", e.target.value)}
            disabled={disabled}
            className="field-input"
          >
            <option value="">Todas</option>
            <option value="ENTREGA">Entrega</option>
            <option value="RETIRADA">Retirada</option>
          </select>
        </div>

        <div>
          <label htmlFor="admin-order-payment" className="field-label">
            Pagamento
          </label>
          <select
            id="admin-order-payment"
            value={values.payment_method}
            onChange={(e) => update("payment_method", e.target.value)}
            disabled={disabled}
            className="field-input"
          >
            <option value="">Todos</option>
            <option value="PIX">Pix</option>
            <option value="CARTAO">Cartão</option>
          </select>
        </div>

        <div>
          <label htmlFor="admin-order-from" className="field-label">
            Data inicial
          </label>
          <input
            id="admin-order-from"
            type="date"
            value={values.date_from}
            onChange={(e) => update("date_from", e.target.value)}
            disabled={disabled}
            className="field-input"
          />
        </div>

        <div>
          <label htmlFor="admin-order-to" className="field-label">
            Data final
          </label>
          <input
            id="admin-order-to"
            type="date"
            value={values.date_to}
            onChange={(e) => update("date_to", e.target.value)}
            disabled={disabled}
            className="field-input"
          />
        </div>

        <div>
          <label htmlFor="admin-order-sort" className="field-label">
            Ordenação
          </label>
          <select
            id="admin-order-sort"
            value={values.sort}
            onChange={(e) => update("sort", e.target.value as "asc" | "desc")}
            disabled={disabled}
            className="field-input"
          >
            <option value="desc">Mais recentes</option>
            <option value="asc">Mais antigos</option>
          </select>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" onClick={onClear} disabled={disabled} className="btn-secondary">
          Limpar filtros
        </button>
      </div>
    </div>
  );
}
