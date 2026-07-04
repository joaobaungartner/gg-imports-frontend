import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/rastrear-pedido")({
  component: RastrearPedidoRedirect,
});

function RastrearPedidoRedirect() {
  return <Navigate to="/acompanhar-pedido" replace />;
}
