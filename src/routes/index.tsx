import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BadgeCheck,
  Loader2,
  Package,
  RefreshCw,
  Shield,
  Shirt,
  Truck,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  listCategories,
  listProducts,
  type Category,
} from "@/lib/api";
import {
  groupProductsByVariant,
  type CatalogProduct,
} from "@/lib/catalogProducts";
import { formatCurrency } from "@/lib/formatCurrency";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  component: HomePage,
});

const BENEFITS = [
  { icon: BadgeCheck, title: "Qualidade verificada" },
  { icon: Truck, title: "Envio para todo Brasil" },
  { icon: RefreshCw, title: "Troca descomplicada" },
  { icon: Shield, title: "Compra segura" },
] as const;

const CATEGORY_ICONS: LucideIcon[] = [Shirt, Shield, Package, BadgeCheck, Truck, RefreshCw];

const HOW_TO_BUY_STEPS = [
  {
    step: "01",
    title: "Escolha sua camisa",
    description: "Navegue pelo catálogo e encontre o time, o estilo e o tamanho certos.",
  },
  {
    step: "02",
    title: "Revise o pedido",
    description: "Confira modelo, tamanho e condições antes de finalizar.",
  },
  {
    step: "03",
    title: "Finalize com tranquilidade",
    description: "Pagamento seguro e acompanhamento do envio até a sua casa.",
  },
] as const;

function HomePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function loadHome() {
      setLoading(true);
      setError("");

      try {
        const [apiProducts, apiCategories] = await Promise.all([
          listProducts(true),
          listCategories(),
        ]);

        if (cancelled) return;

        const categoryNames = Object.fromEntries(
          apiCategories.map((category) => [category.id, category.nome]),
        );

        setCategories(apiCategories);
        setProducts(groupProductsByVariant(apiProducts, categoryNames));
      } catch {
        if (!cancelled) {
          setError("Não foi possível carregar a vitrine. Tente novamente em instantes.");
          setProducts([]);
          setCategories([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadHome();
    return () => {
      cancelled = true;
    };
  }, []);

  const featured = products[0] ?? null;
  const secondaryImages = useMemo(
    () =>
      products
        .slice(1)
        .filter((product) => Boolean(product.imagem_url))
        .slice(0, 2),
    [products],
  );
  const bestSellers = products.slice(0, 4);
  const launches = products.slice(4, 8);
  const promotions = products.slice(8, 12);

  return (
    <div className="overflow-x-hidden bg-[var(--color-canvas)]">
      <HeroSection
        loading={loading}
        featured={featured}
        secondaryImages={secondaryImages}
        productCount={products.length}
      />
      <BenefitsBar />

      {error ? (
        <section className="container-page py-16">
          <div className="alert-error mx-auto max-w-xl text-center">{error}</div>
        </section>
      ) : (
        <>
          <CategoriesSection loading={loading} categories={categories} />
          <ProductGridSection
            id="mais-vendidos"
            eyebrow="Seleção"
            title="Mais vendidos"
            subtitle="Modelos que os torcedores mais procuram na GG Imports."
            items={bestSellers}
            loading={loading}
            linkTo="/catalogo"
            linkLabel="Ver catálogo"
          />
          <ProductGridSection
            id="lancamentos"
            eyebrow="Chegou agora"
            title="Lançamentos"
            subtitle="Peças recentes para vestir a temporada com estilo."
            items={launches}
            loading={loading}
            linkTo="/lancamentos"
            linkLabel="Ver lançamentos"
            cream
          />
          <ProductGridSection
            id="promocoes"
            eyebrow="Oportunidade"
            title="Promoções"
            subtitle="Condições especiais para renovar o guarda-roupa de torcedor."
            items={promotions}
            loading={loading}
            linkTo="/promocoes"
            linkLabel="Ver promoções"
          />
        </>
      )}

      <HowToBuySection />
      <FinalCTA />
    </div>
  );
}

function HeroSection({
  loading,
  featured,
  secondaryImages,
  productCount,
}: {
  loading: boolean;
  featured: CatalogProduct | null;
  secondaryImages: CatalogProduct[];
  productCount: number;
}) {
  return (
    <section className="relative overflow-hidden section-cream">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 12% 18%, color-mix(in srgb, var(--color-lime) 28%, transparent), transparent 42%), radial-gradient(circle at 88% 12%, color-mix(in srgb, var(--color-forest-mid) 12%, transparent), transparent 36%)",
        }}
      />

      <div className="container-page relative grid items-center gap-12 py-14 lg:grid-cols-2 lg:gap-16 lg:py-20">
        <div className="max-w-xl">
          <p className="eyebrow">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-lime)]" />
            Nova coleção
          </p>

          <h1 className="editorial-title mt-5 text-4xl sm:text-5xl lg:text-[4.25rem]">
            Vista sua <span className="editorial-serif">paixão.</span>
          </h1>

          <p className="mt-6 max-w-md text-base leading-relaxed text-[var(--color-muted)] sm:text-lg">
            Camisas que carregam história, rivalidade e memória. Curadoria editorial para quem
            vive o futebol além do placar.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link to="/catalogo" className="btn-primary">
              Explorar catálogo
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/como-comprar" className="btn-ghost">
              Como comprar
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-[var(--color-muted)]">
            <span className="inline-flex items-center gap-2">
              <Truck className="h-4 w-4 text-[var(--color-forest-mid)]" />
              Envio para todo o Brasil
            </span>
            {!loading && productCount > 0 ? (
              <span className="inline-flex items-center gap-2">
                <Shirt className="h-4 w-4 text-[var(--color-forest-mid)]" />
                {productCount} {productCount === 1 ? "modelo" : "modelos"} no catálogo
              </span>
            ) : null}
          </div>
        </div>

        <HeroVisual
          loading={loading}
          featured={featured}
          secondaryImages={secondaryImages}
        />
      </div>
    </section>
  );
}

function HeroVisual({
  loading,
  featured,
  secondaryImages,
}: {
  loading: boolean;
  featured: CatalogProduct | null;
  secondaryImages: CatalogProduct[];
}) {
  if (loading) {
    return (
      <div className="surface-card flex min-h-[420px] items-center justify-center p-8">
        <div className="flex flex-col items-center gap-3 text-[var(--color-muted)]">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--color-forest)]" />
          <p className="text-sm">Carregando vitrine…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
      <div className="absolute -right-3 top-8 hidden h-40 w-28 bg-[var(--color-lime)]/70 sm:block lg:-right-6" />
      <div className="absolute -bottom-4 -left-4 hidden h-24 w-24 bg-[var(--color-forest)] sm:block" />

      <div className="relative grid gap-3 sm:grid-cols-[1.4fr_0.9fr]">
        <Link
          to="/catalogo"
          className="surface-card group relative overflow-hidden transition-transform duration-300 hover:-translate-y-1"
        >
          <div className="relative aspect-[4/5] bg-[var(--color-cream)]">
            {featured?.imagem_url ? (
              <img
                src={featured.imagem_url}
                alt={featured.nome}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
            ) : (
              <ProductImageFallback large />
            )}
            <span className="tag-lime absolute left-3 top-3">Destaque</span>
          </div>
          <div className="border-t border-[var(--color-line)] bg-white p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-muted)]">
              {featured?.clube ?? "GG Imports"}
            </p>
            <p className="font-display mt-1 line-clamp-2 text-base font-bold text-[var(--color-ink)]">
              {featured?.nome ?? "Explore o catálogo"}
            </p>
            {featured ? (
              <p className="mt-2 text-sm font-semibold text-[var(--color-forest)]">
                {formatCurrency(featured.preco)}
              </p>
            ) : (
              <p className="mt-2 text-sm text-[var(--color-muted)]">Produtos em breve</p>
            )}
          </div>
        </Link>

        <div className="flex flex-col gap-3">
          {(secondaryImages.length > 0
            ? secondaryImages
            : [null, null]
          ).map((product, index) => (
            <Link
              key={product?.id ?? `fallback-${index}`}
              to="/catalogo"
              className="surface-card group relative flex-1 overflow-hidden transition-transform duration-300 hover:-translate-y-0.5"
            >
              <div className="relative aspect-[5/4] bg-[var(--color-cream)] sm:aspect-auto sm:min-h-[140px] sm:flex-1">
                {product?.imagem_url ? (
                  <img
                    src={product.imagem_url}
                    alt={product.nome}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                  />
                ) : (
                  <ProductImageFallback compact tone={index === 0 ? "forest" : "cream"} />
                )}
              </div>
            </Link>
          ))}

          <div className="surface-card flex items-center gap-3 bg-[var(--color-forest)] p-4 text-white">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-lime)] text-[var(--color-ink)]">
              <BadgeCheck className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-semibold">Curadoria real</p>
              <p className="text-xs text-white/65">Imagens e preços do catálogo</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductImageFallback({
  large,
  compact,
  tone = "cream",
}: {
  large?: boolean;
  compact?: boolean;
  tone?: "cream" | "forest";
}) {
  return (
    <div
      className={cn(
        "flex h-full w-full flex-col items-center justify-center gap-2",
        tone === "forest"
          ? "bg-[var(--color-forest)] text-[var(--color-lime)]"
          : "bg-[var(--color-cream)] text-[var(--color-forest)]",
      )}
    >
      <Shirt className={cn(large ? "h-14 w-14" : compact ? "h-8 w-8" : "h-10 w-10")} />
      {!compact ? (
        <span className="text-xs font-medium uppercase tracking-[0.12em] opacity-70">
          Camisa
        </span>
      ) : null}
    </div>
  );
}

function BenefitsBar() {
  return (
    <section className="border-y border-[var(--color-line)] bg-[var(--color-canvas)]">
      <div className="container-page">
        <div className="grid gap-0 sm:grid-cols-2 lg:grid-cols-4">
          {BENEFITS.map((benefit, index) => (
            <div
              key={benefit.title}
              className={cn(
                "flex items-center gap-3 px-1 py-5 sm:px-4",
                index < BENEFITS.length - 1 && "lg:border-r lg:border-[var(--color-line)]",
              )}
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center border border-[var(--color-line)] bg-[var(--color-cream)] text-[var(--color-forest)]">
                <benefit.icon className="h-4 w-4" />
              </span>
              <p className="text-sm font-semibold text-[var(--color-ink)]">{benefit.title}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CategoriesSection({
  loading,
  categories,
}: {
  loading: boolean;
  categories: Category[];
}) {
  return (
    <section className="container-page py-14 lg:py-18">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Categorias</p>
          <h2 className="editorial-title mt-2 text-3xl sm:text-4xl">Explore por categoria</h2>
          <p className="mt-2 max-w-lg text-[var(--color-muted)]">
            Encontre a camisa ideal para o seu estilo de torcer.
          </p>
        </div>
        <Link to="/catalogo" className="btn-ghost">
          Ver tudo
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {loading ? (
        <SectionLoading label="Carregando categorias…" />
      ) : categories.length === 0 ? (
        <EmptyBlock message="Categorias em breve. Enquanto isso, explore o catálogo completo." />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category, index) => {
            const Icon = CATEGORY_ICONS[index % CATEGORY_ICONS.length];
            return (
              <Link
                key={category.id}
                to="/catalogo"
                className="surface-card group flex items-center gap-4 p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--color-forest)]/25"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center bg-[var(--color-forest)] text-white transition-transform duration-300 group-hover:scale-105">
                  <Icon className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-display font-semibold text-[var(--color-ink)]">
                    {category.nome}
                  </p>
                  {category.descricao ? (
                    <p className="mt-0.5 line-clamp-2 text-sm text-[var(--color-muted)]">
                      {category.descricao}
                    </p>
                  ) : null}
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-[var(--color-muted)] transition-transform group-hover:translate-x-1 group-hover:text-[var(--color-forest)]" />
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}

function ProductGridSection({
  id,
  eyebrow,
  title,
  subtitle,
  items,
  loading,
  linkTo,
  linkLabel,
  cream,
}: {
  id: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  items: CatalogProduct[];
  loading: boolean;
  linkTo: "/catalogo" | "/lancamentos" | "/promocoes";
  linkLabel: string;
  cream?: boolean;
}) {
  return (
    <section id={id} className={cn("py-14 lg:py-16", cream && "section-cream")}>
      <div className="container-page">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">{eyebrow}</p>
            <h2 className="editorial-title mt-2 text-3xl sm:text-4xl">{title}</h2>
            <p className="mt-2 max-w-lg text-[var(--color-muted)]">{subtitle}</p>
          </div>
          <Link to={linkTo} className="btn-ghost">
            {linkLabel}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {loading ? (
          <SectionLoading label="Carregando produtos…" />
        ) : items.length === 0 ? (
          <EmptyBlock message="Nenhum produto nesta seleção por enquanto. Veja o catálogo completo." />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((product) => (
              <HomeProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function HomeProductCard({ product }: { product: CatalogProduct }) {
  return (
    <Link
      to="/catalogo"
      className="surface-card group flex flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-[var(--color-cream)]">
        {product.imagem_url ? (
          <img
            src={product.imagem_url}
            alt={product.nome}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <ProductImageFallback />
        )}
        {!product.inStock ? (
          <span className="absolute bottom-3 left-3 rounded-full bg-[var(--color-ink)]/85 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
            Sob encomenda
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-muted)]">
          {product.clube}
        </p>
        <h3 className="font-display line-clamp-2 text-sm font-bold leading-snug text-[var(--color-ink)] sm:text-[15px]">
          {product.nome}
        </h3>
        <p className="text-xs text-[var(--color-muted)]">
          {product.categoria} · {product.tipo}
        </p>
        <p className="mt-auto pt-3 font-display text-base font-bold text-[var(--color-forest)]">
          {formatCurrency(product.preco)}
        </p>
      </div>
    </Link>
  );
}

function HowToBuySection() {
  return (
    <section className="border-y border-[var(--color-line)] bg-[var(--color-canvas)] py-14 lg:py-16">
      <div className="container-page">
        <div className="mb-10 max-w-xl">
          <p className="eyebrow">Simples e claro</p>
          <h2 className="editorial-title mt-2 text-3xl sm:text-4xl">Como comprar</h2>
          <p className="mt-2 text-[var(--color-muted)]">
            Do clique ao envio, um processo direto — com suporte quando você precisar.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {HOW_TO_BUY_STEPS.map((step) => (
            <div key={step.step} className="surface-card p-6">
              <span className="font-serif text-3xl italic text-[var(--color-forest-mid)]">
                {step.step}
              </span>
              <h3 className="font-display mt-4 text-lg font-bold text-[var(--color-ink)]">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <Link to="/como-comprar" className="btn-secondary">
            Saiba mais
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="container-page py-14 lg:py-20">
      <div className="relative overflow-hidden border border-[var(--color-line)] bg-[var(--color-forest)] px-6 py-12 sm:px-12 sm:py-16">
        <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-[var(--color-lime)]/20 blur-2xl" />
        <div className="relative max-w-2xl">
          <p className="eyebrow !text-white/55">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-lime)]" />
            GG Imports
          </p>
          <h2 className="editorial-title mt-3 text-3xl text-white sm:text-4xl lg:text-5xl">
            Pronto para vestir a{" "}
            <span className="font-serif italic text-[var(--color-lime)]">camisa</span> do seu
            time?
          </h2>
          <p className="mt-4 max-w-lg text-sm leading-relaxed text-white/65 sm:text-base">
            Explore o catálogo completo. Enviamos para todo o Brasil.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/catalogo"
              className="inline-flex items-center gap-2 rounded-[4px] bg-[var(--color-lime)] px-5 py-3 text-sm font-semibold text-[var(--color-ink)] transition-transform hover:-translate-y-0.5"
            >
              Explorar catálogo
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/promocoes"
              className="inline-flex items-center gap-2 rounded-[4px] border border-white/25 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              Ver promoções
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function SectionLoading({ label }: { label: string }) {
  return (
    <div className="surface-card flex min-h-[180px] items-center justify-center gap-3 text-[var(--color-muted)]">
      <Loader2 className="h-5 w-5 animate-spin text-[var(--color-forest)]" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

function EmptyBlock({ message }: { message: string }) {
  return (
    <div className="surface-card px-6 py-10 text-center">
      <Shirt className="mx-auto h-8 w-8 text-[var(--color-muted)]" />
      <p className="mt-3 text-sm text-[var(--color-muted)]">{message}</p>
      <Link to="/catalogo" className="btn-ghost mt-4 inline-flex">
        Ir ao catálogo
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
