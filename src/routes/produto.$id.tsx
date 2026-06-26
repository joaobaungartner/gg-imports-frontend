import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/produto/$id")({
  component: ProdutoPage,
});

function ProdutoPage() {
  const { id } = Route.useParams();

  return (
    <div className="container-page py-12">
      <h1 className="font-display text-3xl font-bold">Produto</h1>
      <p className="mt-2 text-neutral-600">ID: {id}</p>
    </div>
  );
}
