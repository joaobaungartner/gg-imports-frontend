import { CardPayment } from "@mercadopago/sdk-react";
import { useState, type ComponentProps } from "react";
import { FormSkeleton } from "./CheckoutSkeletons";

export function LoadingCardPayment(props: ComponentProps<typeof CardPayment>) {
  const [loading, setLoading] = useState(true);
  return <div className="relative">
    {loading && <FormSkeleton label="Carregando formulário seguro do cartão" fields={6} />}
    <div className={loading ? "invisible absolute inset-x-0 top-0" : ""} aria-hidden={loading} inert={loading}>
      <CardPayment {...props} onReady={() => { setLoading(false); props.onReady?.(); }} onError={error => { setLoading(false); props.onError?.(error); }} />
    </div>
  </div>;
}
