const CART_KEY = "gg_imports_cart";

export type CartItem = {
  productId: number;
  nome: string;
  imagem_url: string | null;
  preco: number;
  tamanho: string;
  quantidade: number;
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

export function getCartItems(): CartItem[] {
  return readCart();
}

export function addCartItem(item: Omit<CartItem, "quantidade"> & { quantidade: number }) {
  const items = readCart();
  const existing = items.find(
    (cartItem) => cartItem.productId === item.productId && cartItem.tamanho === item.tamanho,
  );

  if (existing) {
    existing.quantidade += item.quantidade;
  } else {
    items.push(item);
  }

  writeCart(items);
  return items;
}

export function clearCart() {
  localStorage.removeItem(CART_KEY);
}

export function getCartCount(): number {
  return readCart().reduce((total, item) => total + item.quantidade, 0);
}
