const CART_KEY = "gg_imports_cart";

export type CartItem = {
  productId: number;
  nome: string;
  clube?: string;
  categoria?: string;
  tipo?: string;
  tamanho: string;
  preco: number;
  quantidade: number;
  imagem_url?: string | null;
  estoque?: number;
};

function readCart(): CartItem[] {
  const raw = localStorage.getItem(CART_KEY);
  if (!raw) return [];

  try {
    return JSON.parse(raw) as CartItem[];
  } catch {
    return [];
  }
}

function writeCart(items: CartItem[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

function findItemIndex(items: CartItem[], productId: number, tamanho: string): number {
  return items.findIndex(
    (item) => item.productId === productId && item.tamanho === tamanho,
  );
}

export function getCartItems(): CartItem[] {
  return readCart();
}

export function getCartItemsCount(): number {
  return readCart().reduce((total, item) => total + item.quantidade, 0);
}

export function getCartTotal(items: CartItem[] = readCart()): number {
  return items.reduce((total, item) => total + item.preco * item.quantidade, 0);
}

export function addCartItem(item: CartItem): CartItem[] {
  const items = readCart();
  const index = findItemIndex(items, item.productId, item.tamanho);

  if (index >= 0) {
    const existing = items[index];
    const nextQuantity = existing.quantidade + item.quantidade;

    if (item.estoque !== undefined && nextQuantity > item.estoque) {
      throw new Error(`Estoque disponível: ${item.estoque} unidade(s).`);
    }

    items[index] = {
      ...existing,
      ...item,
      quantidade: nextQuantity,
    };
  } else {
    if (item.estoque !== undefined && item.quantidade > item.estoque) {
      throw new Error(`Estoque disponível: ${item.estoque} unidade(s).`);
    }

    items.push(item);
  }

  writeCart(items);
  return items;
}

export function removeCartItem(productId: number, tamanho: string): CartItem[] {
  const items = readCart().filter(
    (item) => !(item.productId === productId && item.tamanho === tamanho),
  );
  writeCart(items);
  return items;
}

export function updateCartQuantity(
  productId: number,
  tamanho: string,
  quantidade: number,
): CartItem[] {
  if (quantidade <= 0) {
    return removeCartItem(productId, tamanho);
  }

  const items = readCart();
  const index = findItemIndex(items, productId, tamanho);
  if (index < 0) {
    return items;
  }

  const item = items[index];
  if (item.estoque !== undefined && quantidade > item.estoque) {
    throw new Error(`Estoque disponível: ${item.estoque} unidade(s).`);
  }

  items[index] = { ...item, quantidade };
  writeCart(items);
  return items;
}

export function clearCartStorage(): CartItem[] {
  writeCart([]);
  return [];
}

// Backward compatibility alias
export function clearCart() {
  clearCartStorage();
}

export function getCartCount(): number {
  return getCartItemsCount();
}
