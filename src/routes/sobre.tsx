import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BadgeCheck, Shirt, Truck } from "lucide-react";

export const Route = createFileRoute("/sobre")({
  component: SobrePage,
});

const PILLARS = [
  {
    icon: Shirt,
    title: "Curadoria de mantos",
    text: "Selecionamos modelos de clubes e seleções com acabamento e apresentação dignos de quem veste o time com orgulho.",
  },
  {
    icon: BadgeCheck,
    title: "Qualidade verificada",
    text: "Cada peça passa por checagem visual antes de entrar no catálogo — do tecido ao detalhe do escudo.",
  },
  {
    icon: Truck,
    title: "Compra direta",
    text: "Do catálogo ao WhatsApp do Pix: um fluxo claro, sem enrolação, com acompanhamento do pedido.",
  },
] as const;

function SobrePage() {
  return (
    <div className="section-canvas min-h-[70vh]">
      <div className="container-page py-12 lg:py-16">
        <div className="mx-auto max-w-3xl">
          <div className="mb-12 max-w-2xl">
            <p className="eyebrow">GG Imports</p>
            <h1 className="editorial-title mt-3 text-3xl sm:text-5xl">
              Mantos com{" "}
              <span className="editorial-serif">identidade</span>
            </h1>
            <p className="mt-4 text-base leading-relaxed text-[var(--color-muted)] sm:text-lg">
              A GG Imports nasceu para quem quer vestir o clube com boa apresentação, compra
              simples e suporte humano — forest, cream e aquele toque lime de jogo decisivo.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {PILLARS.map((item) => (
              <div key={item.title} className="surface-card p-6">
                <span className="flex h-10 w-10 items-center justify-center rounded-[4px] bg-[var(--color-cream)] text-[var(--color-forest)]">
                  <item.icon className="h-5 w-5" />
                </span>
                <h2 className="font-display mt-4 text-lg font-bold text-[var(--color-ink)]">
                  {item.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">{item.text}</p>
              </div>
            ))}
          </div>

          <div className="relative mt-12 overflow-hidden rounded-[4px] bg-[var(--color-forest)] px-6 py-10 sm:px-10">
            <div className="pointer-events-none absolute -top-8 -right-8 h-40 w-40 rounded-full bg-[var(--color-lime)]/20 blur-2xl" />
            <div className="relative max-w-xl">
              <h2 className="editorial-title text-2xl text-white sm:text-3xl">
                Pronto para explorar o catálogo?
              </h2>
              <p className="mt-3 text-sm text-white/70">
                Brasileirão, europeus, retrô e mais — escolha o manto do seu time.
              </p>
              <Link
                to="/catalogo"
                className="mt-6 inline-flex items-center gap-2 rounded-[4px] bg-[var(--color-lime)] px-5 py-3 text-sm font-semibold text-[var(--color-ink)] transition-transform hover:-translate-y-0.5"
              >
                Ver catálogo
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
