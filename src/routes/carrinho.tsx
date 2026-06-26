import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/carrinho")({
  component: CarrinhoPage,
});

function CarrinhoPage() {
  return (
    <div className="container-page py-12">
      <h1 className="font-display text-3xl font-bold">Carrinho</h1>
      <p className="mt-2 text-neutral-600">Página em construção.</p>
    </div>
  );
}
