type FilterSelection = "all" | "selected" | "unselected";

export type ProductCollectionFilterValues = {
  search: string;
  category: string;
  selection: FilterSelection;
};

type Props = {
  values: ProductCollectionFilterValues;
  categories: string[];
  onChange: (values: ProductCollectionFilterValues) => void;
};

export function ProductCollectionFilters({ values, categories, onChange }: Props) {
  function update<K extends keyof ProductCollectionFilterValues>(
    key: K,
    value: ProductCollectionFilterValues[K],
  ) {
    onChange({ ...values, [key]: value });
  }

  return (
    <div className="surface-card grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className="sm:col-span-2">
        <label htmlFor="collection-search" className="field-label">
          Buscar
        </label>
        <input
          id="collection-search"
          className="field-input"
          value={values.search}
          onChange={(e) => update("search", e.target.value)}
          placeholder="Nome, clube, categoria ou tipo"
        />
      </div>
      <div>
        <label htmlFor="collection-category" className="field-label">
          Categoria
        </label>
        <select
          id="collection-category"
          className="field-input"
          value={values.category}
          onChange={(e) => update("category", e.target.value)}
        >
          <option value="">Todas</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="collection-selection" className="field-label">
          Seleção
        </label>
        <select
          id="collection-selection"
          className="field-input"
          value={values.selection}
          onChange={(e) => update("selection", e.target.value as FilterSelection)}
        >
          <option value="all">Todos</option>
          <option value="selected">Selecionados</option>
          <option value="unselected">Não selecionados</option>
        </select>
      </div>
    </div>
  );
}
