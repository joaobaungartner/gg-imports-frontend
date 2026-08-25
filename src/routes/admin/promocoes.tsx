import { createFileRoute } from "@tanstack/react-router";
import { AdminProductCollectionManager } from "@/components/admin/AdminProductCollectionManager";

export const Route = createFileRoute("/admin/promocoes")({
  component: AdminPromocoesPage,
});

function AdminPromocoesPage() {
  return (
    <AdminProductCollectionManager
      collectionType="promotions"
      title="Gerenciar promoções"
      description="Selecione quais produtos do catálogo aparecerão na página pública de Promoções. A seleção vale para o produto lógico (todos os tamanhos)."
      publicPath="/promocoes"
    />
  );
}
