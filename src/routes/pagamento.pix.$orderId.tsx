import { createFileRoute } from "@tanstack/react-router";
import { PixPaymentPage } from "@/components/checkout/PixPaymentPage";

export const Route = createFileRoute("/pagamento/pix/$orderId")({
  component: PaymentRoute,
});

function PaymentRoute() {
  const { orderId } = Route.useParams();
  return <PixPaymentPage key={orderId} orderId={Number(orderId)} />;
}
