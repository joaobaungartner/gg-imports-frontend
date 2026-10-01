// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { ProductDetailsModal } from "./ProductDetailsModal";
import type { CatalogProduct } from "@/lib/catalogProducts";

vi.mock("@tanstack/react-router", () => ({ Link: ({ children }: { children: React.ReactNode }) => <a>{children}</a> }));
afterEach(cleanup);
const product: CatalogProduct = {
  id: 1, nome: "Camisa", clube: "Clube", categoria: "Camisas", tipo: "Torcedor", preco: 100,
  imagem_url: null, descricao: null, inStock: false, tamanhos: ["P", "M"],
  variantes: [{ id: 1, tamanho: "P", estoque: 2, ativo: false }, { id: 2, tamanho: "M", estoque: 3, ativo: false }],
};
function mount(isAdmin = true) {
  const activate = vi.fn().mockResolvedValue(undefined);
  render(<ProductDetailsModal product={product} isOpen isAdmin={isAdmin} onClose={vi.fn()}
    onAddToCart={vi.fn()} onActivateProduct={activate} onDeactivateProduct={vi.fn()}
    onDeactivateSize={vi.fn()} onDeleteProduct={vi.fn()} />);
  return activate;
}
it("reactivates every inactive size", async () => {
  const activate = mount();
  await act(async () => { fireEvent.click(screen.getByText("Reativar produto")); });
  expect(activate).toHaveBeenCalledWith([1, 2]);
});
it("allows an admin to select and reactivate only one inactive size", async () => {
  const activate = mount();
  fireEvent.click(screen.getByText("M · Inativo"));
  await act(async () => { fireEvent.click(screen.getByText("Reativar tamanho selecionado")); });
  expect(activate).toHaveBeenCalledWith([2]);
});
it("does not offer administrative actions to customers", () => {
  mount(false);
  expect(screen.queryByText("Reativar produto")).toBeNull();
  expect((screen.getByRole("button", { name: "M" }) as HTMLButtonElement).disabled).toBe(true);
});
