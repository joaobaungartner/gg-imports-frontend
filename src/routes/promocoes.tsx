import { createFileRoute } from "@tanstack/react-router";
import { PublicProductShowcase } from "@/components/products/PublicProductShowcase";

export const Route = createFileRoute("/promocoes")({
  component: PromocoesPage,
});

function PromocoesPage() {
  return (
    <PublicProductShowcase
      config={{
        collection: "promotions",
        eyebrow: "Oportunidade",
        title: (
          <>
            Promoções e <span className="editorial-serif">ofertas</span>
          </>
        ),
        description:
          "Seleção especial da curadoria GG Imports. Quantidades limitadas — aproveite enquanto estiver disponível.",
        emptyTitle: "Nenhuma promoção disponível no momento",
        emptyMessage:
          "Nenhuma promoção disponível no momento. Volte em breve para conferir as novidades.",
      }}
    />
  );
}
