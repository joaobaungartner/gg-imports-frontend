import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/faq")({
  component: FaqPage,
});

const FAQS = [
  {
    q: "Os produtos são originais?",
    a: "Trabalhamos com camisas importadas de alta qualidade, selecionadas com curadoria GG. Cada peça passa por verificação visual e de acabamento antes de ir para o catálogo.",
  },
  {
    q: "Como escolher o tamanho certo?",
    a: "Consulte nossa tabela de medidas e compare com uma camisa que você já use. Em caso de dúvida, fale conosco pelo WhatsApp antes de finalizar o pedido.",
  },
  {
    q: "Quais formas de pagamento aceitam?",
    a: "No checkout você pode escolher Pix (com instruções após a confirmação do pedido) ou outras opções disponíveis na finalização.",
  },
  {
    q: "Como acompanho meu pedido?",
    a: "Use a página Acompanhar pedido com o número do pedido e seus dados, ou faça login para ver todos os seus pedidos automaticamente.",
  },
  {
    q: "Vocês fazem troca?",
    a: "Sim. Trocas são analisadas caso a caso, com prazo e condições alinhados no contato pós-compra. Guarde a embalagem e o número do pedido.",
  },
  {
    q: "Enviam para todo o Brasil?",
    a: "Sim. No checkout você escolhe retirada/combinar com a loja ou entrega. Frete e prazo são confirmados conforme a região.",
  },
] as const;

function FaqPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="section-canvas min-h-[70vh]">
      <div className="container-page py-12 lg:py-16">
        <div className="mx-auto max-w-3xl">
          <div className="mb-10 max-w-xl">
            <p className="eyebrow">Dúvidas</p>
            <h1 className="editorial-title mt-3 text-3xl sm:text-5xl">
              Perguntas <span className="editorial-serif">frequentes</span>
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-[var(--color-muted)] sm:text-base">
              Respostas diretas sobre produtos, tamanhos, pagamento e envio.
            </p>
          </div>

          <div className="space-y-3">
            {FAQS.map((item, index) => {
              const open = openIndex === index;
              return (
                <div key={item.q} className="surface-card overflow-hidden">
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                    onClick={() => setOpenIndex(open ? null : index)}
                    aria-expanded={open}
                  >
                    <span className="font-display text-base font-bold text-[var(--color-ink)] sm:text-lg">
                      {item.q}
                    </span>
                    <ChevronDown
                      className={`h-5 w-5 shrink-0 text-[var(--color-forest)] transition-transform ${open ? "rotate-180" : ""}`}
                    />
                  </button>
                  {open && (
                    <div className="border-t border-[var(--color-line)] px-5 py-4 text-sm leading-relaxed text-[var(--color-muted)]">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link to="/contato" className="btn-primary">
              Falar conosco
            </Link>
            <Link to="/como-comprar" className="btn-secondary">
              Como comprar
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
