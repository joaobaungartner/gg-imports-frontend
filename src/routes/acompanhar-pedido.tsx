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
    <div className="container-page py-12 lg:py-16">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 text-center">
          <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)]">
            <PackageSearch className="h-7 w-7" />
          </span>
          <h1 className="font-display text-3xl font-bold text-neutral-900">Acompanhe seu pedido</h1>
          <p className="mt-2 text-neutral-600">
            {isAuthenticated
              ? "Veja o status dos seus pedidos e acesse os detalhes de cada um."
              : "Informe o número do pedido e seus dados para consultar o status."}
          </p>
        </div>

        {!isAuthenticated && (
          <form
            onSubmit={handleTrackSubmit}
            className="mb-8 rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-soft"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="orderId" className="mb-1.5 block text-sm font-medium text-neutral-700">
                  Número do pedido
                </label>
                <input
                  id="orderId"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  placeholder="Ex.: 123"
                  className="w-full rounded-xl border border-neutral-300 px-4 py-2.5 text-sm outline-none transition-colors focus:border-[var(--color-brand-green)] focus:ring-2 focus:ring-[var(--color-brand-green)]/20"
                />
              </div>

              <div>
                <label htmlFor="identifier" className="mb-1.5 block text-sm font-medium text-neutral-700">
                  E-mail, CPF ou telefone
                </label>
                <input
                  id="identifier"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Dado usado no checkout"
                  className="w-full rounded-xl border border-neutral-300 px-4 py-2.5 text-sm outline-none transition-colors focus:border-[var(--color-brand-green)] focus:ring-2 focus:ring-[var(--color-brand-green)]/20"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={searching}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--color-brand-green)] px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
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

            <p className="mt-4 text-sm text-neutral-500">
              Tem conta?{" "}
              <Link to="/login" search={{ redirect: "/acompanhar-pedido" }} className="font-semibold text-[var(--color-brand-green)] hover:underline">
                Faça login
              </Link>{" "}
              para ver todos os seus pedidos automaticamente.
            </p>
          </form>
        )}

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-[var(--color-brand-green)]" />
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
            <div className="rounded-2xl border border-neutral-200/80 bg-white px-6 py-12 text-center shadow-soft">
              <p className="text-lg font-medium text-neutral-900">Nenhum pedido encontrado.</p>
              <p className="mt-2 text-sm text-neutral-600">
                {isAuthenticated
                  ? "Quando você fizer um pedido, ele aparecerá aqui."
                  : "Verifique o número do pedido e os dados informados."}
              </p>
              <Link
                to="/catalogo"
                className="mt-6 inline-flex items-center justify-center rounded-full bg-[var(--color-brand-green)] px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              >
                Ver catálogo
              </Link>
            </div>
          )
        )}
      </div>
    </div>
  );
}
