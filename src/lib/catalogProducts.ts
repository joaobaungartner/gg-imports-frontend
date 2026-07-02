import type { ProductResponse } from "@/lib/api";

export type CatalogProductVariant = {
  id: number;
  tamanho: string;
  estoque: number;
  ativo: boolean;
};

export type CatalogProduct = {
  id: number;
  nome: string;
  clube: string;
  categoria: string;
  tipo: string;
  preco: number;
  imagem_url: string | null;
  descricao: string | null;
  variantes: CatalogProductVariant[];
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

function sortVariants(variants: CatalogProductVariant[]): CatalogProductVariant[] {
  return [...variants].sort((a, b) => {
    const indexA = SIZE_ORDER.indexOf(a.tamanho as (typeof SIZE_ORDER)[number]);
    const indexB = SIZE_ORDER.indexOf(b.tamanho as (typeof SIZE_ORDER)[number]);

    if (indexA === -1 && indexB === -1) return a.tamanho.localeCompare(b.tamanho);
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });
}

export function getProductIds(product: CatalogProduct): number[] {
  return product.variantes.map((variant) => variant.id);
}

export function groupProductsByVariant(
  products: ProductResponse[],
  categoryNames: Record<number, string>,
): CatalogProduct[] {
  const groups = new Map<string, CatalogProduct>();

  for (const product of products) {
    const key = getGroupKey(product);
    const variant: CatalogProductVariant = {
      id: product.id,
      tamanho: product.tamanho,
      estoque: product.estoque,
      ativo: product.ativo,
    };
    const existing = groups.get(key);

    if (existing) {
      const alreadyExists = existing.variantes.some((item) => item.id === variant.id);
      if (!alreadyExists) {
        existing.variantes.push(variant);
        existing.variantes = sortVariants(existing.variantes);
        existing.tamanhos = sortSizes(existing.variantes.map((item) => item.tamanho));
        existing.inStock = existing.variantes.some((item) => item.ativo && item.estoque > 0);
      }
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
      descricao: product.descricao,
      variantes: [variant],
      tamanhos: [product.tamanho],
      inStock: product.ativo && product.estoque > 0,
    });
  }

  return Array.from(groups.values());
}
