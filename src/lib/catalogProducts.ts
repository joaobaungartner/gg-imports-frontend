import type { ProductResponse } from "@/lib/api";

export type CatalogProduct = {
  id: number;
  nome: string;
  clube: string;
  categoria: string;
  tipo: string;
  preco: number;
  imagem_url: string | null;
  tamanhos: string[];
  inStock: boolean;
};

const SIZE_ORDER = ["P", "M", "G", "GG", "XGG"] as const;

function getGroupKey(product: ProductResponse): string {
  return [
    product.nome.trim().toLowerCase(),
    product.clube.trim().toLowerCase(),
    product.category_id,
    product.tipo.trim().toLowerCase(),
    product.imagem_url ?? "",
    product.preco,
  ].join("|");
}

function sortSizes(sizes: string[]): string[] {
  return [...sizes].sort((a, b) => {
    const indexA = SIZE_ORDER.indexOf(a as (typeof SIZE_ORDER)[number]);
    const indexB = SIZE_ORDER.indexOf(b as (typeof SIZE_ORDER)[number]);

    if (indexA === -1 && indexB === -1) return a.localeCompare(b);
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });
}

export function groupProductsByVariant(
  products: ProductResponse[],
  categoryNames: Record<number, string>,
): CatalogProduct[] {
  const groups = new Map<string, CatalogProduct>();

  for (const product of products) {
    const key = getGroupKey(product);
    const existing = groups.get(key);

    if (existing) {
      if (!existing.tamanhos.includes(product.tamanho)) {
        existing.tamanhos.push(product.tamanho);
        existing.tamanhos = sortSizes(existing.tamanhos);
      }
      existing.inStock = existing.inStock || product.estoque > 0;
      continue;
    }

    groups.set(key, {
      id: product.id,
      nome: product.nome,
      clube: product.clube,
      categoria: categoryNames[product.category_id] ?? "Categoria",
      tipo: product.tipo,
      preco: Number(product.preco),
      imagem_url: product.imagem_url,
      tamanhos: [product.tamanho],
      inStock: product.estoque > 0,
    });
  }

  return Array.from(groups.values());
}
