import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { addCartItem as persistCartItem, getCartCount, getCartItems, type CartItem } from "@/lib/cart";

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  addToCart: (item: Omit<CartItem, "quantidade"> & { quantidade: number }) => void;
  refreshCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => getCartItems());
  const [itemCount, setItemCount] = useState(() => getCartCount());

  const refreshCart = useCallback(() => {
    setItems(getCartItems());
    setItemCount(getCartCount());
  }, []);

  const addToCart = useCallback(
    (item: Omit<CartItem, "quantidade"> & { quantidade: number }) => {
      persistCartItem(item);
      refreshCart();
    },
    [refreshCart],
  );

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const value = useMemo(
    () => ({
      items,
      itemCount,
      addToCart,
      refreshCart,
    }),
    [items, itemCount, addToCart, refreshCart],
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
