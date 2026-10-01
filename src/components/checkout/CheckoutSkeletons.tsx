import { Skeleton, SkeletonRegion } from "@/components/ui/Skeleton";

export function FormSkeleton({ label = "Carregando seus dados", fields = 5 }: { label?: string; fields?: number }) {
  return <SkeletonRegion label={label}>
    <div className="grid gap-4 sm:grid-cols-2">
      {Array.from({ length: fields }, (_, i) => <div key={i} className={i === 0 ? "sm:col-span-2" : ""}>
        <Skeleton className="mb-2 h-4 w-28" /><Skeleton className="h-12 w-full" />
      </div>)}
    </div>
  </SkeletonRegion>;
}

export function OrderCardSkeleton({ label = "Carregando pedido" }: { label?: string }) {
  return <SkeletonRegion label={label} className="surface-card p-6">
    <div className="flex justify-between gap-4"><Skeleton className="h-6 w-32" /><Skeleton className="h-6 w-24" /></div>
    <div className="mt-6 flex gap-4"><Skeleton className="h-20 w-16 shrink-0" /><div className="flex-1 space-y-3"><Skeleton className="h-4 w-3/4" /><Skeleton className="h-4 w-1/2" /><Skeleton className="h-5 w-24" /></div></div>
    <Skeleton className="mt-6 h-11 w-full" />
  </SkeletonRegion>;
}

export function CheckoutPageSkeleton() {
  return <div className="container-page py-12 lg:py-16">
    <SkeletonRegion label="Carregando checkout" className="mb-8"><Skeleton className="h-9 w-48" /><Skeleton className="mt-4 h-4 w-64 max-w-full" /><Skeleton className="mt-8 h-16 w-full" /></SkeletonRegion>
    <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_340px]"><div className="surface-card p-6"><FormSkeleton /></div><OrderCardSkeleton label="Carregando resumo do pedido" /></div>
  </div>;
}

export function PixCodeSkeleton() {
  return <SkeletonRegion label="Carregando código Pix" className="mt-5"><Skeleton className="mx-auto h-60 w-60 max-w-full" /><Skeleton className="mt-6 h-4 w-full" /><Skeleton className="mt-2 h-4 w-3/4" /><Skeleton className="mt-5 h-12 w-full" /><Skeleton className="mt-4 h-20 w-full" /></SkeletonRegion>;
}

export function PixPaymentSkeleton() {
  return <section className="surface-card mt-6 p-5 sm:p-8"><SkeletonRegion label="Carregando pagamento"><Skeleton className="h-4 w-3/4" /><Skeleton className="mt-5 h-4 w-24" /><Skeleton className="mt-2 h-9 w-40" /></SkeletonRegion><PixCodeSkeleton /></section>;
}

export function OrderDetailsSkeleton() {
  return <div className="container-page py-12 lg:py-16"><div className="mx-auto max-w-3xl space-y-5"><SkeletonRegion label="Carregando detalhes do pedido" className="mb-10"><Skeleton className="mx-auto h-9 w-48" /><Skeleton className="mx-auto mt-4 h-4 w-64 max-w-full" /></SkeletonRegion><OrderCardSkeleton /><div className="surface-card p-6"><FormSkeleton label="Carregando informações do pedido" fields={4} /></div></div></div>;
}
