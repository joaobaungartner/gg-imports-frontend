import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function Skeleton({ className }: { className?: string }) {
  return <span aria-hidden="true" className={cn("block rounded bg-[var(--color-line)] motion-safe:animate-pulse", className)} />;
}

export function SkeletonRegion({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return <div role="status" aria-label={label} aria-busy="true" className={className}>
    <span className="sr-only">{label}</span>
    <div aria-hidden="true">{children}</div>
  </div>;
}

export function SkeletonValue({ label, className = "h-5 w-20" }: { label: string; className?: string }) {
  return <span role="status" aria-label={label} aria-busy="true" className="inline-block align-middle"><Skeleton className={className} /></span>;
}
