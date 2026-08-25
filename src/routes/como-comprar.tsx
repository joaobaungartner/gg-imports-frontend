import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Loader2, MessageCircle, Package, Ruler, ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";
import { ApiError, getHowToBuyContent, type HowToBuyContent } from "@/lib/api";

export const Route = createFileRoute("/como-comprar")({
  component: ComoComprarPage,
});

const STEP_ICONS = [ShoppingBag, Ruler, Package, MessageCircle] as const;

function ComoComprarPage() {
  const [content, setContent] = useState<HowToBuyContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getHowToBuyContent()
      .then(setContent)
      .catch((err) => {
        setError(
          err instanceof ApiError
            ? err.message
            : "Não foi possível carregar o conteúdo.",
        );
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="section-canvas min-h-[70vh]">
      <div className="container-page py-12 lg:py-16">
        <div className="mx-auto max-w-3xl">
          {loading ? (
            <div className="surface-card flex flex-col items-center justify-center gap-3 px-6 py-16 text-[var(--color-muted)]">
              <Loader2 className="h-6 w-6 animate-spin text-[var(--color-forest)]" />
              <p className="text-sm font-medium">Carregando…</p>
            </div>
          ) : error || !content ? (
            <div className="alert-error" role="alert">
              {error || "Conteúdo indisponível."}
            </div>
          ) : (
            <>
              <div className="mb-10 max-w-xl">
                <p className="eyebrow">{content.eyebrow}</p>
                <h1 className="editorial-title mt-3 text-3xl sm:text-5xl">
                  {content.title.includes(" ") ? (
                    <>
                      {content.title.split(" ").slice(0, -1).join(" ")}{" "}
                      <span className="editorial-serif">
                        {content.title.split(" ").slice(-1).join(" ")}
                      </span>
                    </>
                  ) : (
                    content.title
                  )}
                </h1>
                <p className="mt-3 text-sm leading-relaxed text-[var(--color-muted)] sm:text-base">
                  {content.subtitle}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {content.steps.map((item, index) => {
                  const Icon = STEP_ICONS[index % STEP_ICONS.length];
                  const stepNumber = String(index + 1).padStart(2, "0");
                  return (
                    <div key={`${item.title}-${index}`} className="surface-card p-6">
                      <div className="flex items-start justify-between gap-3">
                        <span className="font-serif text-3xl italic text-[var(--color-forest-mid)]">
                          {stepNumber}
                        </span>
                        <span className="flex h-9 w-9 items-center justify-center rounded-[4px] bg-[var(--color-cream)] text-[var(--color-forest)]">
                          <Icon className="h-4 w-4" />
                        </span>
                      </div>
                      <h2 className="font-display mt-4 text-lg font-bold text-[var(--color-ink)]">
                        {item.title}
                      </h2>
                      <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">
                        {item.description}
                      </p>
                    </div>
                  );
                })}
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}
