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
  getCartItemsCount,
  getCartTotal,
  removeCartItem,
  updateCartQuantity,
  type CartItem,
  replaceCartStorage,
} from "@/lib/cart";
import { getMyCart, listProducts, syncMyCart } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

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
  const { isAuthenticated, isAdmin } = useAuth();
  const [items, setItems] = useState<CartItem[]>(() => getCartItems());
  const [itemCount, setItemCount] = useState(() => getCartItemsCount());
  const hydrationStarted = useRef(false);
  const hydrated = useRef(false);
  const skipNextSync = useRef(false);

  const syncState = useCallback((nextItems: CartItem[]) => {
    setItems(nextItems);
    setItemCount(getCartItemsCount());
  }, []);

  const refreshCart = useCallback(() => {
    syncState(getCartItems());
  }, [syncState]);

  const addToCart = useCallback(
    (item: AddToCartInput) => {
      const nextItems = addCartItem(item);
      syncState(nextItems);
    },
    [syncState],
  );

  const removeFromCart = useCallback(
    (productId: number, tamanho: string) => {
      const nextItems = removeCartItem(productId, tamanho);
      syncState(nextItems);
    },
    [syncState],
  );

  const updateQuantity = useCallback(
    (productId: number, tamanho: string, quantidade: number) => {
      const nextItems = updateCartQuantity(productId, tamanho, quantidade);
      syncState(nextItems);
    },
    [syncState],
  );

  const clearCart = useCallback(() => {
    const nextItems = clearCartStorage();
    syncState(nextItems);
  }, [syncState]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  useEffect(() => {
    if (!isAuthenticated || isAdmin || hydrationStarted.current) return;
    hydrationStarted.current = true;
    async function hydrateAndMergeCart() {
      try {
        const localItems = getCartItems();
        const cartRequest = localItems.length > 0
          ? syncMyCart(localItems.map((item) => ({ product_id: item.productId, quantidade: item.quantidade })))
          : getMyCart();
        const [serverCart, products] = await Promise.all([cartRequest, listProducts(true)]);
        const productsById = new Map(products.map((product) => [product.id, product]));
        const merged = serverCart.itens.flatMap((item) => {
          const product = productsById.get(item.product_id);
          return product ? [{ productId: product.id, nome: product.nome, clube: product.clube, tipo: product.tipo, tamanho: product.tamanho, preco: Number(product.preco), quantidade: item.quantidade, imagem_url: product.imagem_url, estoque: product.estoque }] : [];
        });
        skipNextSync.current = true;
        syncState(replaceCartStorage(merged));
      } catch {
        // Mantém o carrinho local se a API estiver indisponível.
      } finally {
        hydrated.current = true;
      }
    }
    void hydrateAndMergeCart();
  }, [isAuthenticated, isAdmin, syncState]);

  useEffect(() => {
    if (!isAuthenticated || isAdmin || !hydrated.current) return;
    if (skipNextSync.current) { skipNextSync.current = false; return; }
    const timeout = window.setTimeout(() => {
      void syncMyCart(items.map((item) => ({ product_id: item.productId, quantidade: item.quantidade }))).catch(() => undefined);
    }, 250);
    return () => window.clearTimeout(timeout);
  }, [isAuthenticated, isAdmin, items]);

  const cartTotal = useMemo(() => getCartTotal(items), [items]);

  const value = useMemo(
    () => ({
      items,
      itemCount,
      cartTotal,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getCartTotal: () => getCartTotal(items),
      getCartItemsCount: () => getCartItemsCount(),
    }),
    [items, itemCount, cartTotal, addToCart, removeFromCart, updateQuantity, clearCart],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart deve ser usado dentro de CartProvider");
  }
  return context;
}
