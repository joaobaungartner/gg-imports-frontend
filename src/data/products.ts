export type Product = {
  id: string;
  name: string;
  club: string;
  category: string;
  categorySlug: string;
  price: number;
  originalPrice?: number;
  onSale?: boolean;
  isNew?: boolean;
  inStock: boolean;
  imageColor: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string;
};

export const categories: Category[] = [
  { id: "brasileirao", name: "Brasileirão", slug: "brasileirao", description: "Clubes do futebol nacional" },
  { id: "europeus", name: "Europeus", slug: "europeus", description: "Ligas da Europa e grandes clubes" },
  { id: "selecoes", name: "Seleções", slug: "selecoes", description: "Seleções nacionais e copas" },
  { id: "retro", name: "Retrô", slug: "retro", description: "Modelos clássicos e edições especiais" },
  { id: "infantil", name: "Infantil", slug: "infantil", description: "Tamanhos kids e juvenis" },
  { id: "player-version", name: "Player Version", slug: "player-version", description: "Versão jogador, tecido premium" },
];

export const products: Product[] = [
  {
    id: "flamengo-home-24",
    name: "Flamengo Home 24/25",
    club: "Flamengo",
    category: "Brasileirão",
    categorySlug: "brasileirao",
    price: 249.9,
    originalPrice: 299.9,
    onSale: true,
    inStock: true,
    imageColor: "#9d0208",
  },
  {
    id: "palmeiras-away-24",
    name: "Palmeiras Away 24/25",
    club: "Palmeiras",
    category: "Brasileirão",
    categorySlug: "brasileirao",
    price: 259.9,
    isNew: true,
    inStock: true,
    imageColor: "#006437",
  },
  {
    id: "corinthians-third-24",
    name: "Corinthians Third 24/25",
    club: "Corinthians",
    category: "Brasileirão",
    categorySlug: "brasileirao",
    price: 239.9,
    inStock: true,
    imageColor: "#1a1a1a",
  },
  {
    id: "real-madrid-home-24",
    name: "Real Madrid Home 24/25",
    club: "Real Madrid",
    category: "Europeus",
    categorySlug: "europeus",
    price: 319.9,
    isNew: true,
    inStock: true,
    imageColor: "#fefefe",
  },
  {
    id: "barcelona-away-24",
    name: "Barcelona Away 24/25",
    club: "Barcelona",
    category: "Europeus",
    categorySlug: "europeus",
    price: 309.9,
    originalPrice: 349.9,
    onSale: true,
    inStock: true,
    imageColor: "#1a2f5a",
  },
  {
    id: "psg-home-24",
    name: "PSG Home 24/25",
    club: "Paris Saint-Germain",
    category: "Europeus",
    categorySlug: "europeus",
    price: 299.9,
    inStock: true,
    imageColor: "#004170",
  },
  {
    id: "brasil-home-24",
    name: "Brasil Home 24",
    club: "Seleção Brasileira",
    category: "Seleções",
    categorySlug: "selecoes",
    price: 279.9,
    isNew: true,
    inStock: true,
    imageColor: "#ffdf00",
  },
  {
    id: "argentina-away-24",
    name: "Argentina Away 24",
    club: "Seleção Argentina",
    category: "Seleções",
    categorySlug: "selecoes",
    price: 289.9,
    inStock: true,
    imageColor: "#75aadb",
  },
  {
    id: "brasil-94-retro",
    name: "Brasil 94 Retrô",
    club: "Seleção Brasileira",
    category: "Retrô",
    categorySlug: "retro",
    price: 269.9,
    originalPrice: 319.9,
    onSale: true,
    inStock: true,
    imageColor: "#ffdf00",
  },
  {
    id: "milan-07-retro",
    name: "Milan 07 Retrô",
    club: "AC Milan",
    category: "Retrô",
    categorySlug: "retro",
    price: 259.9,
    inStock: true,
    imageColor: "#fb090b",
  },
  {
    id: "flamengo-infantil-24",
    name: "Flamengo Infantil 24/25",
    club: "Flamengo",
    category: "Infantil",
    categorySlug: "infantil",
    price: 189.9,
    isNew: true,
    inStock: true,
    imageColor: "#9d0208",
  },
  {
    id: "city-player-24",
    name: "Man City Player Version 24/25",
    club: "Manchester City",
    category: "Player Version",
    categorySlug: "player-version",
    price: 389.9,
    originalPrice: 429.9,
    onSale: true,
    inStock: true,
    imageColor: "#6cabdd",
  },
];

export function formatPrice(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
