import { Link } from "@tanstack/react-router";
import { LogIn, LogOut, Menu, Search, ShoppingBag, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Catálogo", to: "/catalogo" },
  { label: "Lançamentos", to: "/lancamentos" },
  { label: "Promoções", to: "/promocoes" },
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
    { label: "Rastrear pedido", to: "/rastrear-pedido" },
    { label: "FAQ", to: "/faq" },
  ],
  institucional: [
    { label: "Sobre", to: "/sobre" },
    { label: "Contato", to: "/contato" },
  ],
} as const;

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth();
  const { itemCount } = useCart();

  function handleLogout() {
    setMenuOpen(false);
    logout();
  }

  return (
    <header className="sticky top-0 z-50">
      <div className="bg-[var(--color-brand-dark)] px-4 py-2 text-center text-xs text-neutral-300 sm:text-sm">
        Envio para todo o Brasil • Pix com desconto • Atendimento via WhatsApp
      </div>

      <div className="border-b border-neutral-200/80 bg-white/95 backdrop-blur-md">
        <div className="container-page flex items-center justify-between gap-4 py-4">
          <Link to="/" className="flex shrink-0 flex-col leading-none">
            <span className="font-display text-xl font-bold tracking-tight text-[var(--color-brand-dark)] sm:text-2xl">
              GG <span className="text-gold">Imports</span>
            </span>
            <span className="mt-0.5 text-[10px] uppercase tracking-[0.2em] text-neutral-500 sm:text-xs">
              Camisas de futebol
            </span>
          </Link>

          <nav className="hidden items-center gap-6 lg:flex">
            {NAV_LINKS.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="text-sm font-medium text-neutral-600 transition-colors hover:text-[var(--color-brand-green)]"
                activeProps={{ className: "text-[var(--color-brand-green)]" }}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            {isAuthenticated ? (
              <button
                type="button"
                onClick={handleLogout}
                className="hidden items-center gap-1.5 rounded-full border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-700 transition-colors hover:border-red-400 hover:text-red-600 sm:inline-flex"
              >
                <LogOut className="h-4 w-4" />
                Sair
              </button>
            ) : (
              <Link
                to="/login"
                className="hidden items-center gap-1.5 rounded-full border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-700 transition-colors hover:border-[var(--color-brand-green)] hover:text-[var(--color-brand-green)] sm:inline-flex"
              >
                <LogIn className="h-4 w-4" />
                Entrar
              </Link>
            )}
            <button
              type="button"
              className="hidden rounded-full p-2 text-neutral-600 transition-colors hover:bg-neutral-100 sm:flex"
              aria-label="Buscar"
            >
              <Search className="h-5 w-5" />
            </button>
            <Link
              to="/carrinho"
              className="relative rounded-full p-2 text-neutral-600 transition-colors hover:bg-neutral-100"
              aria-label="Carrinho"
            >
              <ShoppingBag className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--color-brand-green)] px-1 text-[10px] font-bold text-white">
                  {itemCount > 99 ? "99+" : itemCount}
                </span>
              )}
            </Link>
            <button
              type="button"
              className="rounded-full p-2 text-neutral-600 transition-colors hover:bg-neutral-100 lg:hidden"
              aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
              onClick={() => setMenuOpen((open) => !open)}
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <div
          className={cn(
            "overflow-hidden border-t border-neutral-100 bg-white transition-all lg:hidden",
            menuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0",
          )}
        >
          <nav className="container-page flex flex-col gap-1 py-4">
            {NAV_LINKS.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            {isAuthenticated ? (
              <button
                type="button"
                onClick={handleLogout}
                className="mt-2 flex w-full items-center gap-2 rounded-lg border border-neutral-300 px-3 py-2.5 text-sm font-semibold text-neutral-700 transition-colors hover:border-red-400 hover:text-red-600"
              >
                <LogOut className="h-4 w-4" />
                Sair
              </button>
            ) : (
              <Link
                to="/login"
                className="mt-2 flex items-center gap-2 rounded-lg bg-[var(--color-brand-green)] px-3 py-2.5 text-sm font-semibold text-white"
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
    <footer className="border-t border-neutral-200 bg-[var(--color-brand-dark)] text-neutral-300">
      <div className="container-page grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2 lg:col-span-1">
          <p className="font-display text-xl font-bold text-white">
            GG <span className="text-gold">Imports</span>
          </p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-neutral-400">
            Camisas de futebol importadas com qualidade premium. Brasileirão, europeus, seleções,
            retrô, infantil e player version.
          </p>
        </div>

        <FooterColumn title="Loja" links={FOOTER_LINKS.loja} />
        <FooterColumn title="Ajuda" links={FOOTER_LINKS.ajuda} />
        <FooterColumn title="Institucional" links={FOOTER_LINKS.institucional} />
      </div>

      <div className="border-t border-white/10">
        <div className="container-page py-5 text-center text-xs text-neutral-500">
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
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gold">{title}</p>
      <ul className="space-y-2 text-sm">
        {links.map((link) => (
          <li key={link.to}>
            <Link to={link.to} className="hover:text-white">
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
