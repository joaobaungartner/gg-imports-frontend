import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BadgeCheck,
  Clock,
  CreditCard,
  Globe,
  Headphones,
  MapPin,
  MessageCircle,
  Package,
  RefreshCw,
  Shield,
  Shirt,
  Sparkles,
  Star,
  Trophy,
  Truck,
  Users,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { categories, products, type Category, type Product } from "@/data/products";
import { cn } from "@/lib/utils";

/** Substitua pelo link real do WhatsApp quando disponível */
const WHATSAPP_URL = "#";

export const Route = createFileRoute("/")({
  component: HomePage,
});

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  brasileirao: Trophy,
  europeus: Globe,
  selecoes: Shield,
  retro: Clock,
  infantil: Users,
  "player-version": Zap,
};

const BENEFITS = [
  { icon: Truck, title: "Envio para todo o Brasil", description: "Entrega em todo o território nacional" },
  { icon: CreditCard, title: "Pagamento facilitado", description: "Pix, cartão e parcelamento" },
  { icon: Shield, title: "Compra segura", description: "Processo transparente e protegido" },
  { icon: MessageCircle, title: "Atendimento via WhatsApp", description: "Tire dúvidas antes e depois da compra" },
  { icon: RefreshCw, title: "Troca fácil", description: "Suporte para ajuste de tamanho" },
] as const;

const HOW_TO_BUY_STEPS = [
  { step: 1, title: "Escolha sua camisa", description: "Navegue pelo catálogo e encontre seu time" },
  { step: 2, title: "Selecione tamanho e modelo", description: "Fan, player version, infantil ou retrô" },
  { step: 3, title: "Finalize o pedido", description: "Compre pelo site ou fale conosco no WhatsApp" },
  { step: 4, title: "Receba em casa", description: "Acompanhe o envio ou tire dúvidas a qualquer momento" },
] as const;

const TRUST_CARDS = [
  { icon: Sparkles, text: "Produtos selecionados com atenção aos detalhes" },
  { icon: Headphones, text: "Atendimento próximo antes e depois da compra" },
  { icon: Shirt, text: "Modelos para torcedores, colecionadores e presentes" },
] as const;

function HomePage() {
  const bestSellers = products.slice(0, 4);
  const launches = products.filter((p: Product) => p.isNew);
  const promos = products.filter((p: Product) => p.onSale);

  return (
    <div className="overflow-x-hidden">
      <HeroSection />
      <BenefitsBar />
      <CategoriesSection />
      <ProductGridSection
        id="mais-vendidos"
        title="Mais vendidos"
        subtitle="Os modelos que os torcedores mais pedem"
        items={bestSellers}
        linkTo="/catalogo"
        linkLabel="Ver todos"
      />
      <ProductGridSection
        id="lancamentos"
        title="Lançamentos"
        subtitle="Novidades que acabaram de chegar"
        items={launches}
        linkTo="/lancamentos"
        linkLabel="Ver lançamentos"
        accent
      />
      <ProductGridSection
        id="promocoes"
        title="Promoções"
        subtitle="Ofertas por tempo limitado"
        items={promos}
        linkTo="/promocoes"
        linkLabel="Ver promoções"
      />
      <HowToBuySection />
      <TrustSection />
      <FinalCTA />
    </div>
  );
}

function HeroSection() {
  return (
    <section className="jersey-bg pitch-pattern relative overflow-hidden">
      <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-[var(--color-gold)]/10 blur-3xl" />
      <div className="absolute -bottom-32 -left-20 h-96 w-96 rounded-full bg-[var(--color-brand-green-light)]/30 blur-3xl" />

      <div className="container-page relative grid items-center gap-10 py-14 lg:grid-cols-2 lg:gap-12 lg:py-20">
        <div className="max-w-xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">
            <Star className="h-3.5 w-3.5 text-gold" />
            Qualidade premium importada
          </span>

          <h1 className="font-display mt-5 text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
            Camisas de futebol importadas com{" "}
            <span className="text-gold">qualidade premium</span>
          </h1>

          <p className="mt-5 text-base leading-relaxed text-neutral-300 sm:text-lg">
            Brasileirão, europeus, seleções, retrô, infantil e player version — tudo em um só lugar,
            com pronta entrega em modelos selecionados.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/catalogo"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--color-gold)] px-6 py-3 text-sm font-semibold text-[var(--color-brand-dark)] shadow-elevated transition-transform hover:scale-[1.02]"
            >
              Ver catálogo
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href={WHATSAPP_URL}
              className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
            >
              <MessageCircle className="h-4 w-4" />
              Comprar pelo WhatsApp
            </a>
          </div>

          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-neutral-300">
            <li className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gold" />
              Envio para todo Brasil
            </li>
            <li className="flex items-center gap-2">
              <BadgeCheck className="h-4 w-4 text-gold" />
              Pix com desconto
            </li>
            <li className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-gold" />
              Atendimento rápido
            </li>
          </ul>
        </div>

        <div className="relative mx-auto w-full max-w-md lg:max-w-none">
          <div className="jersey-card-visual relative overflow-hidden rounded-3xl p-6 shadow-elevated sm:p-8">
            <div className="absolute right-4 top-4 rounded-full bg-[var(--color-gold)] px-3 py-1 text-xs font-bold text-[var(--color-brand-dark)]">
              PRONTA ENTREGA
            </div>

            <div className="flex flex-col items-center pt-4">
              <div className="relative">
                <div className="h-56 w-44 rounded-t-[3rem] rounded-b-xl bg-gradient-to-b from-red-700 to-red-900 shadow-elevated sm:h-64 sm:w-52">
                  <div className="absolute inset-x-0 top-[22%] mx-auto h-3 w-[50%] rounded-full bg-black/20" />
                  <div className="absolute inset-x-0 top-[36%] flex justify-center gap-1.5">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <span key={i} className="h-7 w-0.5 rounded-full bg-white/30" />
                    ))}
                  </div>
                  <div className="absolute inset-x-0 bottom-6 flex justify-center">
                    <span className="rounded bg-white/90 px-2 py-0.5 text-[10px] font-bold tracking-widest text-red-900">
                      GG IMPORTS
                    </span>
                  </div>
                </div>
                <div className="absolute -right-6 top-8 h-48 w-36 rounded-t-[2.5rem] rounded-b-lg bg-gradient-to-b from-sky-700 to-sky-900 opacity-60 shadow-soft sm:h-52 sm:w-40" />
              </div>

              <div className="mt-6 grid w-full grid-cols-3 gap-2 text-center">
                {[
                  { label: "Clubes BR", value: "50+" },
                  { label: "Europa", value: "80+" },
                  { label: "Seleções", value: "30+" },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-xl bg-white/8 px-2 py-3">
                    <p className="font-display text-lg font-bold text-gold">{stat.value}</p>
                    <p className="text-[10px] text-neutral-400">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function BenefitsBar() {
  return (
    <section className="border-b border-neutral-200 bg-[var(--color-surface)]">
      <div className="container-page py-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {BENEFITS.map((benefit) => (
            <div
              key={benefit.title}
              className="flex items-start gap-3 rounded-2xl bg-white p-4 shadow-soft"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)]">
                <benefit.icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-neutral-900">{benefit.title}</p>
                <p className="mt-0.5 text-xs text-neutral-500">{benefit.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CategoriesSection() {
  return (
    <section className="container-page py-14 lg:py-18">
      <div className="mb-8 text-center sm:mb-10">
        <h2 className="font-display text-2xl font-bold text-neutral-900 sm:text-3xl">
          Explore por categoria
        </h2>
        <p className="mt-2 text-neutral-600">Encontre a camisa ideal para o seu estilo</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category: Category) => {
          const Icon = CATEGORY_ICONS[category.id] ?? Shirt;
          return (
            <Link
              key={category.id}
              to="/catalogo"
              className="group flex items-center gap-4 rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:border-[var(--color-brand-green)]/30 hover:shadow-elevated"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--color-brand-green)] text-white transition-transform group-hover:scale-110">
                <Icon className="h-6 w-6" />
              </span>
              <div>
                <p className="font-display font-semibold text-neutral-900">{category.name}</p>
                <p className="text-sm text-neutral-500">{category.description}</p>
              </div>
              <ArrowRight className="ml-auto h-4 w-4 text-neutral-400 transition-transform group-hover:translate-x-1 group-hover:text-[var(--color-brand-green)]" />
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function ProductGridSection({
  id,
  title,
  subtitle,
  items,
  linkTo,
  linkLabel,
  accent,
}: {
  id: string;
  title: string;
  subtitle: string;
  items: Product[];
  linkTo: "/catalogo" | "/lancamentos" | "/promocoes";
  linkLabel: string;
  accent?: boolean;
}) {
  return (
    <section id={id} className={cn("py-14 lg:py-16", accent && "bg-[var(--color-surface)]")}>
      <div className="container-page">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold text-neutral-900 sm:text-3xl">{title}</h2>
            <p className="mt-1 text-neutral-600">{subtitle}</p>
          </div>
          <Link
            to={linkTo}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--color-brand-green)] hover:underline"
          >
            {linkLabel}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}

function HowToBuySection() {
  return (
    <section className="border-y border-neutral-200 bg-white py-14 lg:py-16">
      <div className="container-page">
        <div className="mb-10 text-center">
          <h2 className="font-display text-2xl font-bold text-neutral-900 sm:text-3xl">Como comprar</h2>
          <p className="mt-2 text-neutral-600">Simples, rápido e com suporte em cada etapa</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {HOW_TO_BUY_STEPS.map((step) => (
            <div
              key={step.step}
              className="relative rounded-2xl border border-neutral-200/80 p-6 shadow-soft"
            >
              <span className="font-display flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-gold)] text-sm font-bold text-[var(--color-brand-dark)]">
                {step.step}
              </span>
              <h3 className="font-display mt-4 font-semibold text-neutral-900">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-600">{step.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link
            to="/como-comprar"
            className="inline-flex items-center gap-2 rounded-full border border-neutral-300 px-6 py-2.5 text-sm font-semibold text-neutral-800 transition-colors hover:bg-neutral-50"
          >
            Saiba mais
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function TrustSection() {
  return (
    <section className="bg-[var(--color-brand-dark)] py-14 text-white lg:py-16">
      <div className="container-page">
        <div className="mb-10 text-center">
          <h2 className="font-display text-2xl font-bold sm:text-3xl">
            Por que escolher a <span className="text-gold">GG Imports</span>
          </h2>
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          {TRUST_CARDS.map((card) => (
            <div key={card.text} className="jersey-card-visual rounded-2xl p-6 text-center">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-gold)]/20 text-gold">
                <card.icon className="h-6 w-6" />
              </span>
              <p className="mt-4 text-sm leading-relaxed text-neutral-300">{card.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="container-page py-14 lg:py-20">
      <div className="relative overflow-hidden rounded-3xl jersey-bg pitch-pattern px-6 py-12 text-center shadow-elevated sm:px-12 sm:py-16">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[var(--color-gold)]/15 blur-2xl" />
        <Package className="relative mx-auto h-10 w-10 text-gold" />
        <h2 className="font-display relative mt-4 text-2xl font-bold text-white sm:text-3xl lg:text-4xl">
          Pronto para vestir a camisa do seu time?
        </h2>
        <p className="relative mx-auto mt-3 max-w-lg text-neutral-300">
          Explore o catálogo completo ou fale com a gente no WhatsApp. Enviamos para todo o Brasil.
        </p>
        <div className="relative mt-8 flex flex-wrap justify-center gap-3">
          <Link
            to="/catalogo"
            className="inline-flex items-center gap-2 rounded-full bg-[var(--color-gold)] px-6 py-3 text-sm font-semibold text-[var(--color-brand-dark)] transition-transform hover:scale-[1.02]"
          >
            Explorar catálogo
            <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href={WHATSAPP_URL}
            className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
          >
            <MessageCircle className="h-4 w-4" />
            Falar no WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}
