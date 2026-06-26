import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/lancamentos")({
  component: LancamentosPage,
});

function LancamentosPage() {
  return (
    <div className="container-page py-12">
      <h1 className="font-display text-3xl font-bold">Lançamentos</h1>
      <p className="mt-2 text-neutral-600">Página em construção.</p>
    </div>
  );
}
