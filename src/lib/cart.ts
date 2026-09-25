const CART_KEY = "gg_imports_cart";
export type CartOwner = number | null;

function cartKey(owner: CartOwner): string {
  // The legacy shared cart has no reliable owner and must not be imported.
  return `${CART_KEY}:${owner === null ? "guest" : `user:${owner}`}`;
}

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

function readCart(owner: CartOwner = null): CartItem[] {
  const raw = localStorage.getItem(cartKey(owner));
  if (!raw) return [];

  try {
    return JSON.parse(raw) as CartItem[];
  } catch {
    return [];
  }
}

function writeCart(items: CartItem[], owner: CartOwner = null) {
  localStorage.setItem(cartKey(owner), JSON.stringify(items));
}

export function replaceCartStorage(items: CartItem[], owner: CartOwner = null): CartItem[] {
  writeCart(items, owner);
  return items;
}

function findItemIndex(items: CartItem[], productId: number, tamanho: string): number {
  return items.findIndex(
    (item) => item.productId === productId && item.tamanho === tamanho,
  );
}

export function getCartItems(owner: CartOwner = null): CartItem[] {
  return readCart(owner);
}

export function getCartItemsCount(owner: CartOwner = null): number {
  return readCart(owner).reduce((total, item) => total + item.quantidade, 0);
}

export function getCartTotal(items: CartItem[] = readCart()): number {
  return items.reduce((total, item) => total + item.preco * item.quantidade, 0);
}

export function addCartItem(item: CartItem, owner: CartOwner = null): CartItem[] {
  const items = readCart(owner);
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

  writeCart(items, owner);
  return items;
}

export function removeCartItem(productId: number, tamanho: string, owner: CartOwner = null): CartItem[] {
  const items = readCart(owner).filter(
    (item) => !(item.productId === productId && item.tamanho === tamanho),
  );
  writeCart(items, owner);
  return items;
}

export function updateCartQuantity(
  productId: number,
  tamanho: string,
  quantidade: number,
  owner: CartOwner = null,
): CartItem[] {
  if (quantidade <= 0) {
    return removeCartItem(productId, tamanho, owner);
  }

  const items = readCart(owner);
  const index = findItemIndex(items, productId, tamanho);
  if (index < 0) {
    return items;
  }

  const item = items[index];
  if (item.estoque !== undefined && quantidade > item.estoque) {
    throw new Error(`Estoque disponível: ${item.estoque} unidade(s).`);
  }

  items[index] = { ...item, quantidade };
  writeCart(items, owner);
  return items;
}

export function clearCartStorage(owner: CartOwner = null): CartItem[] {
  writeCart([], owner);
  return [];
}

// Backward compatibility alias
export function clearCart() {
  clearCartStorage();
}

export function getCartCount(): number {
  return getCartItemsCount();
}

// Called only on guest -> login, never when switching authenticated accounts.
export function adoptGuestCart(owner: number) {
  const items = getCartItems();
  if (items.length === 0) return;
  replaceCartStorage(items, owner);
  clearCartStorage();
}
