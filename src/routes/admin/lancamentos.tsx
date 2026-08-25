import { createFileRoute } from "@tanstack/react-router";
import { AdminProductCollectionManager } from "@/components/admin/AdminProductCollectionManager";

export const Route = createFileRoute("/admin/lancamentos")({
  component: AdminLancamentosPage,
});

function AdminLancamentosPage() {
  return (
    <AdminProductCollectionManager
      collectionType="launches"
      title="Gerenciar lançamentos"
      description="Escolha quais produtos entram na vitrine pública de Lançamentos. Remover daqui não afeta Promoções nem o catálogo."
      publicPath="/lancamentos"
    />
  );
}
