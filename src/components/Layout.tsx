import { Link } from "@tanstack/react-router";
import { LogIn, LogOut, Menu, ShoppingBag, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Catálogo", to: "/catalogo" },
  { label: "Lançamentos", to: "/lancamentos" },
  { label: "Promoções", to: "/promocoes" },
  { label: "Acompanhe seu pedido", to: "/acompanhar-pedido" },
  { label: "Como comprar", to: "/como-comprar" },
  { label: "Contato", to: "/contato" },
] as const;

const FOOTER_LINKS = {
  loja: [
    { label: "Catálogo", to: "/catalogo" },
    { label: "Lançamentos", to: "/lancamentos" },
    { label: "Promoções", to: "/promocoes" },
  ],
  ajuda: [
    { label: "Como comprar", to: "/como-comprar" },
    { label: "Tabela de medidas", to: "/tabela-medidas" },
    { label: "Rastrear pedido", to: "/acompanhar-pedido" },
    { label: "FAQ", to: "/faq" },
  ],
  institucional: [
    { label: "Sobre", to: "/sobre" },
    { label: "Contato", to: "/contato" },
  ],
} as const;

function BrandMark({ inverted = false }: { inverted?: boolean }) {
  return (
    <Link to="/" className="group flex shrink-0 items-center gap-2.5">
      <span
        className={cn(
          "relative flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold tracking-tight",
          inverted ? "bg-white text-[var(--color-forest)]" : "bg-[var(--color-forest)] text-white",
        )}
      >
        GG
        <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-[var(--color-lime)]" />
      </span>
      <span className="leading-none">
        <span
          className={cn(
            "font-display block text-[15px] font-800 font-extrabold tracking-[0.08em] sm:text-base",
            inverted ? "text-white" : "text-[var(--color-ink)]",
          )}
        >
          GG IMPORTS
        </span>
        <span
          className={cn(
            "mt-0.5 block text-[10px] uppercase tracking-[0.18em]",
            inverted ? "text-white/55" : "text-[var(--color-muted)]",
          )}
        >
          Camisas de futebol
        </span>
      </span>
    </Link>
  );
}

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const { itemCount } = useCart();

  function handleLogout() {
    setMenuOpen(false);
    logout();
  }

  return (
    <header className="sticky top-0 z-50">
      <div className="bg-[var(--color-forest)] px-4 py-2 text-center text-[11px] text-white/85 sm:text-xs">
        <span className="hidden sm:inline">Frete grátis acima de R$ 399 · </span>
        <span>5% OFF no Pix · Envio para todo o Brasil</span>
      </div>

      <div className="border-b border-[var(--color-line)] bg-[var(--color-canvas)]/90 backdrop-blur-md">
        <div className="container-page flex items-center justify-between gap-4 py-3.5">
          <BrandMark />

          <nav className="hidden items-center gap-5 xl:flex">
            {NAV_LINKS.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="text-[13px] font-medium text-[var(--color-muted)] transition-colors hover:text-[var(--color-forest)]"
                activeProps={{ className: "text-[var(--color-forest)]" }}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-2.5">
            {isAuthenticated ? (
              <button
                type="button"
                onClick={handleLogout}
                className="hidden items-center gap-1.5 border border-[var(--color-line)] px-3 py-2 text-[13px] font-medium text-[var(--color-ink)] transition-colors hover:border-[var(--color-danger)] hover:text-[var(--color-danger)] sm:inline-flex"
                style={{ borderRadius: 4 }}
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="max-w-28 truncate">{user?.nome?.split(" ")[0] ?? "Sair"}</span>
              </button>
            ) : (
              <Link
                to="/login"
                className="hidden items-center gap-1.5 border border-[var(--color-line)] px-3 py-2 text-[13px] font-medium text-[var(--color-ink)] transition-colors hover:border-[var(--color-forest)] hover:text-[var(--color-forest)] sm:inline-flex"
                style={{ borderRadius: 4 }}
              >
                <LogIn className="h-3.5 w-3.5" />
                Entrar
              </Link>
            )}

            <Link
              to="/carrinho"
              className="btn-primary gap-2 !px-3 !py-2"
              aria-label="Carrinho"
            >
              <ShoppingBag className="h-4 w-4" />
              <span className="hidden sm:inline">Carrinho</span>
              <span className="tag-lime !px-1.5 !py-0.5 !text-[10px]">
                {itemCount > 99 ? "99+" : itemCount}
              </span>
            </Link>

            <button
              type="button"
              className="border border-[var(--color-line)] p-2 text-[var(--color-ink)] transition-colors hover:bg-[var(--color-cream)] xl:hidden"
              style={{ borderRadius: 4 }}
              aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
              onClick={() => setMenuOpen((open) => !open)}
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <div
          className={cn(
            "overflow-hidden border-t border-[var(--color-line)] bg-[var(--color-canvas)] transition-all xl:hidden",
            menuOpen ? "max-h-[28rem] opacity-100" : "max-h-0 opacity-0",
          )}
        >
          <nav className="container-page flex flex-col gap-0.5 py-4">
            {NAV_LINKS.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="px-3 py-2.5 text-sm font-medium text-[var(--color-ink)] hover:bg-[var(--color-cream)]"
                style={{ borderRadius: 4 }}
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            {isAuthenticated ? (
              <button
                type="button"
                onClick={handleLogout}
                className="mt-2 flex w-full items-center gap-2 border border-[var(--color-line)] px-3 py-2.5 text-sm font-semibold text-[var(--color-ink)]"
                style={{ borderRadius: 4 }}
              >
                <LogOut className="h-4 w-4" />
                Sair
              </button>
            ) : (
              <Link
                to="/login"
                className="btn-primary mt-2"
                onClick={() => setMenuOpen(false)}
              >
                <LogIn className="h-4 w-4" />
                Entrar
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="bg-[var(--color-forest)] text-white/75">
      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2 lg:col-span-1">
          <BrandMark inverted />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/55">
            Camisas que carregam história, rivalidade e memória. Curadoria para quem vive o futebol.
          </p>
          <p className="font-serif mt-5 text-lg italic text-[var(--color-lime)]">
            Feito para quem vive o futebol
          </p>
        </div>

        <FooterColumn title="Loja" links={FOOTER_LINKS.loja} />
        <FooterColumn title="Ajuda" links={FOOTER_LINKS.ajuda} />
        <FooterColumn title="Institucional" links={FOOTER_LINKS.institucional} />
      </div>

      <div className="border-t border-white/10">
        <div className="container-page py-5 text-center text-xs text-white/40">
          © {new Date().getFullYear()} GG Imports. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: readonly { label: string; to: string }[];
}) {
  return (
    <div>
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-lime)]">
        {title}
      </p>
      <ul className="space-y-2 text-sm">
        {links.map((link) => (
          <li key={link.to}>
            <Link to={link.to} className="text-white/65 transition-colors hover:text-white">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
