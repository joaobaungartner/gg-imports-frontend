import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  addCartItem,
  clearCartStorage,
  getCartItems,
  getCartTotal,
  removeCartItem,
  updateCartQuantity,
  type CartItem,
  replaceCartStorage,
} from "@/lib/cart";
import { getMyCart, listProducts, syncMyCart } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { getToken, getUser } from "@/lib/auth";

type AddToCartInput = Omit<CartItem, "quantidade"> & { quantidade: number };

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  cartTotal: number;
  addToCart: (item: AddToCartInput) => void;
  removeFromCart: (productId: number, tamanho: string) => void;
  updateQuantity: (productId: number, tamanho: string, quantidade: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartItemsCount: () => number;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const owner = isAuthenticated && user ? user.id : null;
  // A new identity gets entirely new state, timers and hydration lifecycle.
  return <ScopedCartProvider key={`${owner ?? "guest"}:${isAdmin}`} owner={owner} syncEnabled={owner !== null && !isAdmin}>{children}</ScopedCartProvider>;
}

function ScopedCartProvider({ children, owner, syncEnabled }: {
  children: ReactNode;
  owner: number | null;
  syncEnabled: boolean;
}) {
  const [items, setItems] = useState<CartItem[]>(() => getCartItems(owner));
  const [ready, setReady] = useState(false);
  const [dirty, setDirty] = useState(false);
  const revision = useRef(0);
  const [sessionToken] = useState(getToken);
  const sessionIsCurrent = useCallback(() =>
    getToken() === sessionToken && (getUser()?.id ?? null) === owner,
  [owner, sessionToken]);

  const syncState = useCallback((nextItems: CartItem[]) => {
    revision.current += 1;
    setItems(nextItems);
    setDirty(true);
  }, []);

  const addToCart = useCallback((item: AddToCartInput) => {
    if (sessionIsCurrent()) syncState(addCartItem(item, owner));
  }, [owner, sessionIsCurrent, syncState]);
  const removeFromCart = useCallback((productId: number, tamanho: string) => {
    if (sessionIsCurrent()) syncState(removeCartItem(productId, tamanho, owner));
  }, [owner, sessionIsCurrent, syncState]);
  const updateQuantity = useCallback((productId: number, tamanho: string, quantidade: number) => {
    if (sessionIsCurrent()) syncState(updateCartQuantity(productId, tamanho, quantidade, owner));
  }, [owner, sessionIsCurrent, syncState]);
  const clearCart = useCallback(() => {
    if (sessionIsCurrent()) syncState(clearCartStorage(owner));
  }, [owner, sessionIsCurrent, syncState]);

  useEffect(() => {
    if (!syncEnabled || !sessionIsCurrent()) return;
    let active = true;
    const controller = new AbortController();
    const initialRevision = revision.current;
    async function hydrateCart() {
      try {
        const localItems = getCartItems(owner);
        const cartRequest = localItems.length > 0
          ? syncMyCart(localItems.map((item) => ({ product_id: item.productId, quantidade: item.quantidade })), controller.signal)
          : getMyCart(controller.signal);
        const [serverCart, products] = await Promise.all([cartRequest, listProducts(true)]);
        if (!active || !sessionIsCurrent()) return;
        const productsById = new Map(products.map((product) => [product.id, product]));
        const merged = serverCart.itens.flatMap((item) => {
          const product = productsById.get(item.product_id);
          return product ? [{ productId: product.id, nome: product.nome, clube: product.clube, tipo: product.tipo, tamanho: product.tamanho, preco: Number(product.preco), quantidade: item.quantidade, imagem_url: product.imagem_url, estoque: product.estoque }] : [];
        });
        // Do not overwrite edits made while hydration was in flight.
        if (revision.current === initialRevision) setItems(replaceCartStorage(merged, owner));
      } catch {
        // Keep only this owner's local cart when the API is unavailable.
      } finally {
        if (active && sessionIsCurrent()) setReady(true);
      }
    }
    void hydrateCart();
    return () => { active = false; controller.abort(); };
  }, [owner, syncEnabled, sessionIsCurrent]);

  useEffect(() => {
    if (!syncEnabled || !ready || !dirty) return;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => {
      // Auth storage changes synchronously, before React effect cleanup.
      if (!sessionIsCurrent()) return;
      void syncMyCart(items.map((item) => ({ product_id: item.productId, quantidade: item.quantidade })), controller.signal).catch(() => undefined);
    }, 250);
    return () => { window.clearTimeout(timeout); controller.abort(); };
  }, [syncEnabled, ready, dirty, items, sessionIsCurrent]);

  const itemCount = items.reduce((total, item) => total + item.quantidade, 0);
  const cartTotal = useMemo(() => getCartTotal(items), [items]);
  const value = useMemo(() => ({
    items, itemCount, cartTotal, addToCart, removeFromCart, updateQuantity, clearCart,
    getCartTotal: () => cartTotal,
    getCartItemsCount: () => itemCount,
  }), [items, itemCount, cartTotal, addToCart, removeFromCart, updateQuantity, clearCart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart deve ser usado dentro de CartProvider");
  }
  return context;
}
