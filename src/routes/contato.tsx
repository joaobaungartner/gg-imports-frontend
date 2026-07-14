import { createFileRoute, Link } from "@tanstack/react-router";
import { Mail, MapPin, MessageCircle } from "lucide-react";

export const Route = createFileRoute("/contato")({
  component: ContatoPage,
});

const PIX_CONTACT = "(19) 99846-0550";

function ContatoPage() {
  return (
    <div className="section-canvas min-h-[70vh]">
      <div className="container-page py-12 lg:py-16">
        <div className="mx-auto max-w-3xl">
          <div className="mb-10 max-w-xl">
            <p className="eyebrow">Atendimento</p>
            <h1 className="editorial-title mt-3 text-3xl sm:text-5xl">
              Fale com a <span className="editorial-serif">GG Imports</span>
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-[var(--color-muted)] sm:text-base">
              Tire dúvidas sobre pedidos, tamanhos e disponibilidade. Respondemos pelo WhatsApp
              nos horários de atendimento.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <a
              href={`https://wa.me/5519998460550`}
              target="_blank"
              rel="noreferrer"
              className="surface-card group flex flex-col gap-3 p-6 transition-transform hover:-translate-y-0.5"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-[4px] bg-[var(--color-cream)] text-[var(--color-forest)]">
                <MessageCircle className="h-5 w-5" />
              </span>
              <h2 className="font-display text-lg font-bold text-[var(--color-ink)]">WhatsApp</h2>
              <p className="text-sm text-[var(--color-muted)]">{PIX_CONTACT}</p>
              <span className="btn-ghost mt-auto !p-0 text-sm">Abrir conversa</span>
            </a>

            <div className="surface-card flex flex-col gap-3 p-6">
              <span className="flex h-10 w-10 items-center justify-center rounded-[4px] bg-[var(--color-cream)] text-[var(--color-forest)]">
                <Mail className="h-5 w-5" />
              </span>
              <h2 className="font-display text-lg font-bold text-[var(--color-ink)]">E-mail</h2>
              <p className="text-sm text-[var(--color-muted)]">Use o WhatsApp para retorno mais rápido.</p>
            </div>

            <div className="surface-card flex flex-col gap-3 p-6">
              <span className="flex h-10 w-10 items-center justify-center rounded-[4px] bg-[var(--color-cream)] text-[var(--color-forest)]">
                <MapPin className="h-5 w-5" />
              </span>
              <h2 className="font-display text-lg font-bold text-[var(--color-ink)]">Retirada</h2>
              <p className="text-sm text-[var(--color-muted)]">
                Combinamos local e horário após a confirmação do pedido.
              </p>
            </div>
          </div>

          <div className="section-cream mt-10 rounded-[4px] border border-[var(--color-line)] p-6 sm:p-8">
            <h2 className="editorial-title text-2xl">Antes de escrever</h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">
              Para pedidos, informe o número (ex.: #123) e o e-mail ou CPF usados no checkout.
              Assim localizamos seu pedido mais rápido.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/acompanhar-pedido" className="btn-primary">
                Acompanhar pedido
              </Link>
              <Link to="/faq" className="btn-secondary">
                Ver FAQ
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
