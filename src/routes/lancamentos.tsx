import { createFileRoute } from "@tanstack/react-router";
import { PublicProductShowcase } from "@/components/products/PublicProductShowcase";

export const Route = createFileRoute("/lancamentos")({
  component: LancamentosPage,
});

function LancamentosPage() {
  return (
    <PublicProductShowcase
      config={{
        collection: "launches",
        eyebrow: (
          <>
            <span className="tag-lime">Novo</span>
            Chegou agora
          </>
        ),
        title: (
          <>
            Lançamentos da <span className="editorial-serif">temporada</span>
          </>
        ),
        description:
          "Os mantos mais recentes da curadoria GG — modelos escolhidos pela loja para vestir o time com identidade.",
        emptyTitle: "Nenhum lançamento disponível no momento",
        emptyMessage: "Nenhum lançamento disponível no momento. Novos mantos estão chegando.",
      }}
    />
  );
}
