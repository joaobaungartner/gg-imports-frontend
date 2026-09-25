// @vitest-environment jsdom
import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { CartProvider, useCart } from "./CartContext";
import { adoptGuestCart, getCartItems, replaceCartStorage, type CartItem } from "@/lib/cart";
import { saveToken, saveUser, clearAuth } from "@/lib/auth";
import type { ServerCart } from "@/lib/api";

const mocks = vi.hoisted(() => ({
  auth: { user: null as null | { id: number }, isAuthenticated: false, isAdmin: false },
  get: vi.fn(), sync: vi.fn(), products: vi.fn(),
}));
vi.mock("@/contexts/AuthContext", () => ({ useAuth: () => mocks.auth }));
vi.mock("@/lib/api", () => ({ getMyCart: mocks.get, syncMyCart: mocks.sync, listProducts: mocks.products }));
const item: CartItem = { productId: 1, nome: "Camisa", tamanho: "M", preco: 100, quantidade: 1 };
const server = (id: number): ServerCart => ({ id, client_id: id, itens: [{ id, product_id: id, quantidade: 1, preco_unitario: "100" }], valor_total: "100" });
function session(id: number | null) {
  mocks.auth = { user: id === null ? null : { id }, isAuthenticated: id !== null, isAdmin: false };
  if (id === null) clearAuth();
  else { saveToken(`token-${id}`); saveUser({ id, nome: "Cliente", email: "test@example.com", role: "CLIENTE" }); }
}
function View() {
  const cart = useCart();
  return <><output data-testid="items">{cart.items.map(i => i.productId).join(",")}</output><button onClick={() => cart.addToCart(item)}>Add</button></>;
}
const tree = () => <CartProvider><View /></CartProvider>;
async function flush() { await act(async () => { await Promise.resolve(); }); }
beforeEach(() => {
  localStorage.clear(); vi.clearAllMocks(); vi.useFakeTimers(); session(null);
  mocks.get.mockResolvedValue(server(1));
  mocks.sync.mockImplementation(async (items: Array<{ product_id: number; quantidade: number }>) => ({ ...server(1), itens: items }));
  mocks.products.mockResolvedValue([1, 2].map(id => ({ id, nome: `Camisa ${id}`, tamanho: "M", preco: "100" })));
});
afterEach(() => { cleanup(); vi.useRealTimers(); });

it("isolates account storage from guests and ignores the unowned legacy cart", () => {
  localStorage.setItem("gg_imports_cart", JSON.stringify([item]));
  expect(getCartItems()).toEqual([]);
  replaceCartStorage([item], 1);
  expect(getCartItems(2)).toEqual([]);
  expect(getCartItems()).toEqual([]);
  expect(getCartItems(1)).toEqual([item]);
});

it("adopts guest items once without making account items available to the next guest", () => {
  replaceCartStorage([item]); adoptGuestCart(1); adoptGuestCart(2);
  expect(getCartItems(1)).toEqual([item]);
  expect(getCartItems(2)).toEqual([]);
  expect(getCartItems()).toEqual([]);
});

it("clears the visible cart on logout and hydrates the next account independently", async () => {
  session(1); const view = render(tree()); await flush();
  expect(screen.getByTestId("items").textContent).toBe("1");
  session(null); view.rerender(tree());
  expect(screen.getByTestId("items").textContent).toBe("");
  mocks.get.mockResolvedValue(server(2)); session(2); view.rerender(tree()); await flush();
  expect(screen.getByTestId("items").textContent).toBe("2");
  expect(mocks.sync).not.toHaveBeenCalled();
});

it("ignores late hydration from the previous account even if cancellation is ignored", async () => {
  let resolve!: (value: ServerCart) => void;
  mocks.get.mockReturnValueOnce(new Promise<ServerCart>(done => { resolve = done; }));
  session(1); const view = render(tree());
  const oldSignal = mocks.get.mock.calls[0][0] as AbortSignal;
  mocks.get.mockResolvedValue(server(2)); session(2); view.rerender(tree()); await flush();
  expect(oldSignal.aborted).toBe(true);
  await act(async () => { resolve(server(1)); });
  expect(screen.getByTestId("items").textContent).toBe("2");
  expect(getCartItems(2).map(i => i.productId)).toEqual([2]);
  expect(mocks.sync).not.toHaveBeenCalled();
});

it("cancels a pending write when switching accounts", async () => {
  session(1); const view = render(tree()); await flush();
  act(() => { screen.getByText("Add").click(); });
  mocks.get.mockResolvedValue(server(2)); session(2); view.rerender(tree()); await flush();
  await act(async () => { vi.advanceTimersByTime(300); });
  expect(mocks.sync).not.toHaveBeenCalled();
  expect(screen.getByTestId("items").textContent).toBe("2");
});

it("syncs edits for the active account", async () => {
  session(1); render(tree()); await flush();
  act(() => { screen.getByText("Add").click(); });
  await act(async () => { vi.advanceTimersByTime(300); });
  expect(mocks.sync).toHaveBeenCalledWith([{ product_id: 1, quantidade: 2 }], expect.any(AbortSignal));
});

it("blocks a queued write as soon as credentials change, before React rerenders", async () => {
  session(1); render(tree()); await flush();
  act(() => { screen.getByText("Add").click(); });
  session(2);
  await act(async () => { vi.advanceTimersByTime(300); });
  expect(mocks.sync).not.toHaveBeenCalled();
});
