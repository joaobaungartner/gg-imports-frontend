import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/sobre")({
  component: SobrePage,
});

function SobrePage() {
  return (
    <div className="container-page py-12">
      <h1 className="font-display text-3xl font-bold">Sobre</h1>
      <p className="mt-2 text-neutral-600">Página em construção.</p>
    </div>
  );
}
