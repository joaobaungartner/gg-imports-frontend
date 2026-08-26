export type NavItem = {
  label: string;
  to: string;
  hash?: string;
};

export function getMainNavItems(isAdmin: boolean): NavItem[] {
  if (isAdmin) {
    return [
      { label: "Catálogo", to: "/catalogo" },
      { label: "Lançamentos", to: "/admin/lancamentos" },
      { label: "Promoções", to: "/admin/promocoes" },
      { label: "Pedidos", to: "/admin/pedidos" },
      { label: "Gestão", to: "/admin/gestao" },
      { label: "Como comprar", to: "/admin/como-comprar" },
      { label: "Cadastrar produto", to: "/admin/cadastrar-produto" },
    ];
  }

  return [
    { label: "Catálogo", to: "/catalogo" },
    { label: "Lançamentos", to: "/lancamentos" },
    { label: "Promoções", to: "/promocoes" },
    { label: "Acompanhe seu pedido", to: "/acompanhar-pedido" },
    { label: "Como comprar", to: "/como-comprar" },
  ];
}

export const FOOTER_LOJA_LINKS: NavItem[] = [
  { label: "Catálogo", to: "/catalogo" },
  { label: "Lançamentos", to: "/lancamentos" },
  { label: "Promoções", to: "/promocoes" },
];

export const FOOTER_AJUDA_LINKS: NavItem[] = [
  { label: "Como comprar", to: "/como-comprar" },
  { label: "Tabela de medidas", to: "/tabela-medidas" },
  { label: "Rastrear pedido", to: "/acompanhar-pedido" },
  { label: "FAQ", to: "/faq" },
];

export const FOOTER_INSTITUCIONAL_LINKS: NavItem[] = [
  { label: "Sobre", to: "/sobre" },
  { label: "Contato", to: "/", hash: "contato" },
];

export const CONTACT_INFO = {
  phoneDisplay: "(19) 99846-0550",
  phoneTel: "tel:+5519998460550",
  whatsappUrl: "https://wa.me/5519998460550",
  pickupNote: "Combinamos local e horário após a confirmação do pedido.",
} as const;
