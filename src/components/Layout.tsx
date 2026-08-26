import { Link } from "@tanstack/react-router";
import { LogIn, LogOut, Menu, MessageCircle, Phone, ShoppingBag, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import {
  CONTACT_INFO,
  FOOTER_AJUDA_LINKS,
  FOOTER_INSTITUCIONAL_LINKS,
  FOOTER_LOJA_LINKS,
  getMainNavItems,
  type NavItem,
} from "@/lib/navigation";
import { cn } from "@/lib/utils";

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

function NavLinkItem({
  item,
  className,
  onClick,
}: {
  item: NavItem;
  className?: string;
  onClick?: () => void;
}) {
  if (item.hash) {
    return (
      <a href={`${item.to}#${item.hash}`} className={className} onClick={onClick}>
        {item.label}
      </a>
    );
  }

  return (
    <Link
      to={item.to}
      className={className}
      activeProps={{ className: "text-[var(--color-forest)]" }}
      onClick={onClick}
    >
      {item.label}
    </Link>
  );
}

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { isAuthenticated, user, logout, isAdmin } = useAuth();
  const { itemCount } = useCart();
  const navItems = getMainNavItems(isAdmin);

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
            {navItems.map((item) => (
              <NavLinkItem
                key={`${item.to}-${item.label}`}
                item={item}
                className={cn(
                  "text-[13px] font-medium text-[var(--color-muted)] transition-colors hover:text-[var(--color-forest)]",
                  isAdmin &&
                    (item.to.startsWith("/admin/pedidos") ||
                      item.to.startsWith("/admin/cadastrar"))
                    ? "font-semibold text-[var(--color-forest)]"
                    : null,
                )}
              />
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-2.5">
            {isAuthenticated ? (
              <Link
                to={isAdmin ? "/admin/pedidos" : "/minha-conta"}
                className="hidden items-center gap-1.5 border border-[var(--color-line)] px-3 py-2 text-[13px] font-medium text-[var(--color-ink)] transition-colors hover:border-[var(--color-danger)] hover:text-[var(--color-danger)] sm:inline-flex"
                style={{ borderRadius: 4 }}
              >
                <LogIn className="h-3.5 w-3.5" />
                <span className="max-w-28 truncate">
                  {isAdmin ? "Admin" : user?.nome?.split(" ")[0] ?? "Sair"}
                </span>
              </Link>
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
            menuOpen ? "max-h-[32rem] opacity-100" : "max-h-0 opacity-0",
          )}
        >
          <nav className="container-page flex flex-col gap-0.5 py-4">
            {navItems.map((item) => (
              <NavLinkItem
                key={`mobile-${item.to}-${item.label}`}
                item={item}
                className="px-3 py-2.5 text-sm font-medium text-[var(--color-ink)] hover:bg-[var(--color-cream)]"
                onClick={() => setMenuOpen(false)}
              />
            ))}
            {isAuthenticated ? (
              <div className="mt-2 grid gap-2"><Link to={isAdmin ? "/admin/pedidos" : "/minha-conta"} className="btn-secondary" onClick={() => setMenuOpen(false)}>Minha conta</Link><button type="button" onClick={handleLogout} className="btn-ghost"><LogOut className="h-4 w-4" />Sair</button></div>
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
            Camisas que carregam história, rivalidade e memória. Curadoria para quem vive o
            futebol.
          </p>
          <p className="font-serif mt-5 text-lg italic text-[var(--color-lime)]">
            Feito para quem vive o futebol
          </p>
        </div>

        <FooterColumn title="Loja" links={FOOTER_LOJA_LINKS} />
        <FooterColumn title="Ajuda" links={FOOTER_AJUDA_LINKS} />
        <FooterColumn title="Institucional" links={FOOTER_INSTITUCIONAL_LINKS} />
      </div>

      <div
        id="contato"
        className="scroll-mt-24 border-t border-white/10"
      >
        <div className="container-page grid gap-6 py-10 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-lime)]">
              Contato
            </p>
            <p className="text-sm leading-relaxed text-white/65">
              Tire dúvidas sobre pedidos, tamanhos e disponibilidade. Respondemos pelo WhatsApp
              nos horários de atendimento.
            </p>
          </div>
          <div className="space-y-3 text-sm">
            <a
              href={CONTACT_INFO.whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-white/75 transition-colors hover:text-white"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp {CONTACT_INFO.phoneDisplay}
            </a>
            <a
              href={CONTACT_INFO.phoneTel}
              className="flex items-center gap-2 text-white/75 transition-colors hover:text-white"
            >
              <Phone className="h-4 w-4" />
              {CONTACT_INFO.phoneDisplay}
            </a>
          </div>
          <div className="text-sm text-white/65">
            <p className="font-medium text-white/85">Retirada</p>
            <p className="mt-1">{CONTACT_INFO.pickupNote}</p>
            <p className="mt-3 text-white/55">
              Para pedidos, informe o número e o e-mail ou CPF usados no checkout.
            </p>
          </div>
        </div>
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
  links: readonly NavItem[];
}) {
  return (
    <div>
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-lime)]">
        {title}
      </p>
      <ul className="space-y-2 text-sm">
        {links.map((link) => (
          <li key={`${link.to}-${link.label}`}>
            {link.hash ? (
              <a
                href={`${link.to}#${link.hash}`}
                className="text-white/65 transition-colors hover:text-white"
              >
                {link.label}
              </a>
            ) : (
              <Link to={link.to} className="text-white/65 transition-colors hover:text-white">
                {link.label}
              </Link>
            )}
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
