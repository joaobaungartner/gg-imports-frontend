import { createFileRoute, Link } from "@tanstack/react-router";
import { Loader2, PackageSearch, Search } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { OrderListCard } from "@/components/orders/OrderListCard";
import { useAuth } from "@/contexts/AuthContext";
import { ApiError, getMyOrders, trackOrder, type OrderListItem } from "@/lib/api";
import { orderResponseToListItem } from "@/lib/orderMappers";
import { saveOrderConfirmation } from "@/lib/orderStorage";

export const Route = createFileRoute("/acompanhar-pedido")({
  component: AcompanharPedidoPage,
});

function AcompanharPedidoPage() {
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<OrderListItem[]>([]);
  const [loading, setLoading] = useState(isAuthenticated);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");
  const [orderId, setOrderId] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setOrders([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    getMyOrders()
      .then(setOrders)
      .catch((err) => {
        const message =
          err instanceof ApiError ? err.message : "Não foi possível carregar seus pedidos.";
        setError(message);
      })
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  async function handleTrackSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setHasSearched(true);

    const parsedOrderId = Number(orderId.trim());
    if (!Number.isFinite(parsedOrderId) || parsedOrderId <= 0) {
      setError("Informe um número de pedido válido.");
      setOrders([]);
      return;
    }

    if (!identifier.trim()) {
      setError("Informe seu e-mail, CPF ou telefone.");
      setOrders([]);
      return;
    }

    setSearching(true);
    try {
      const order = await trackOrder({
        order_id: parsedOrderId,
        identifier: identifier.trim(),
      });
      saveOrderConfirmation(order);
      setOrders([orderResponseToListItem(order)]);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Não foi possível localizar o pedido.";
      setError(message);
      setOrders([]);
    } finally {
      setSearching(false);
    }
  }

  return (
    <div className="section-canvas min-h-[70vh]">
      <div className="container-page py-12 lg:py-16">
        <div className="mx-auto max-w-3xl">
          <div className="mb-10 text-center">
            <p className="eyebrow justify-center">
              <PackageSearch className="h-3.5 w-3.5" />
              Rastreamento
            </p>
            <h1 className="editorial-title mt-3 text-3xl sm:text-4xl">
              Acompanhe seu <span className="editorial-serif">pedido</span>
            </h1>
            <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-[var(--color-muted)] sm:text-base">
              {isAuthenticated
                ? "Veja o status dos seus pedidos e acesse os detalhes de cada um."
                : "Informe o número do pedido e seus dados para consultar o status."}
            </p>
          </div>

          {!isAuthenticated && (
            <form onSubmit={handleTrackSubmit} className="surface-card mb-8 p-6 sm:p-8">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="orderId" className="field-label">
                    Número do pedido
                  </label>
                  <input
                    id="orderId"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    placeholder="Ex.: 123"
                    className="field-input"
                  />
                </div>

                <div>
                  <label htmlFor="identifier" className="field-label">
                    E-mail, CPF ou telefone
                  </label>
                  <input
                    id="identifier"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Dado usado no checkout"
                    className="field-input"
                  />
                </div>
              </div>

              <button type="submit" disabled={searching} className="btn-primary mt-5 w-full sm:w-auto">
                {searching ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Buscando...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4" />
                    Buscar pedido
                  </>
                )}
              </button>

              <p className="mt-4 text-sm text-[var(--color-muted)]">
                Tem conta?{" "}
                <Link
                  to="/login"
                  search={{ redirect: "/acompanhar-pedido" }}
                  className="btn-ghost inline !p-0 font-semibold"
                >
                  Faça login
                </Link>{" "}
                para ver todos os seus pedidos automaticamente.
              </p>
            </form>
          )}

          {error && (
            <div className="alert-error mb-6" role="alert">
              {error}
            </div>
          )}

          {loading ? (
            <div className="surface-card flex flex-col items-center justify-center gap-3 px-6 py-16 text-[var(--color-muted)]">
              <Loader2 className="h-6 w-6 animate-spin text-[var(--color-forest)]" />
              <p className="text-sm font-medium">Carregando pedidos…</p>
            </div>
          ) : orders.length > 0 ? (
            <div className="space-y-4">
              {orders.map((order) => (
                <OrderListCard key={order.id} order={order} />
              ))}
            </div>
          ) : (
            !searching &&
            !loading &&
            (isAuthenticated || hasSearched) && (
              <div className="surface-card px-6 py-12 text-center">
                <p className="editorial-title text-2xl">Nenhum pedido encontrado</p>
                <p className="mx-auto mt-2 max-w-md text-sm text-[var(--color-muted)]">
                  {isAuthenticated
                    ? "Quando você fizer um pedido, ele aparecerá aqui."
                    : "Verifique o número do pedido e os dados informados."}
                </p>
                <Link to="/catalogo" className="btn-primary mt-6 inline-flex">
                  Ver catálogo
                </Link>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
