import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
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
} from "@/lib/cart";

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
  const [items, setItems] = useState<CartItem[]>(() => getCartItems());
  const [itemCount, setItemCount] = useState(() => getCartItemsCount());

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
