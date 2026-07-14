import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, MessageCircle, Package, Ruler, ShoppingBag } from "lucide-react";

export const Route = createFileRoute("/como-comprar")({
  component: ComoComprarPage,
});

const STEPS = [
  {
    step: "01",
    icon: ShoppingBag,
    title: "Escolha sua camisa",
    description:
      "Navegue pelo catálogo, filtre por categoria e escolha o modelo, o tipo e o tamanho certos.",
  },
  {
    step: "02",
    icon: Ruler,
    title: "Confira medidas",
    description:
      "Use a tabela de medidas e compare com uma peça do seu guarda-roupa. Em dúvida, fale conosco.",
  },
  {
    step: "03",
    icon: Package,
    title: "Finalize o pedido",
    description:
      "Revise o carrinho, informe entrega ou retirada e confirme o pagamento (incluindo Pix quando aplicável).",
  },
  {
    step: "04",
    icon: MessageCircle,
    title: "Acompanhe e receba",
    description:
      "Guarde o número do pedido. Acompanhe o status na conta ou pela página de rastreamento.",
  },
] as const;

function ComoComprarPage() {
  return (
    <div className="section-canvas min-h-[70vh]">
      <div className="container-page py-12 lg:py-16">
        <div className="mx-auto max-w-3xl">
          <div className="mb-10 max-w-xl">
            <p className="eyebrow">Passo a passo</p>
            <h1 className="editorial-title mt-3 text-3xl sm:text-5xl">
              Como <span className="editorial-serif">comprar</span>
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-[var(--color-muted)] sm:text-base">
              Do clique ao envio: um processo direto, com suporte quando você precisar.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {STEPS.map((item) => (
              <div key={item.step} className="surface-card p-6">
                <div className="flex items-start justify-between gap-3">
                  <span className="font-serif text-3xl italic text-[var(--color-forest-mid)]">
                    {item.step}
                  </span>
                  <span className="flex h-9 w-9 items-center justify-center rounded-[4px] bg-[var(--color-cream)] text-[var(--color-forest)]">
                    <item.icon className="h-4 w-4" />
                  </span>
                </div>
                <h2 className="font-display mt-4 text-lg font-bold text-[var(--color-ink)]">
                  {item.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">
                  {item.description}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link to="/catalogo" className="btn-primary">
              Ir ao catálogo
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/tabela-medidas" className="btn-secondary">
              Tabela de medidas
            </Link>
            <Link to="/faq" className="btn-ghost">
              Ver FAQ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
