import { Check } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type CheckoutStepDefinition = {
  id: number;
  label: string;
  shortLabel: string;
  icon: LucideIcon;
};

type CheckoutStepperProps = {
  steps: CheckoutStepDefinition[];
  currentStep: number;
};

export function CheckoutStepper({ steps, currentStep }: CheckoutStepperProps) {
  return (
    <div className="mb-8">
      <div className="mb-4 flex items-center justify-between sm:hidden">
        <p className="text-sm font-medium text-neutral-900">
          Etapa {currentStep} de {steps.length}
        </p>
        <p className="text-sm text-neutral-500">
          {steps.find((step) => step.id === currentStep)?.label}
        </p>
      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-neutral-100 sm:hidden">
        <div
          className="h-full rounded-full bg-[var(--color-brand-green)] transition-all duration-300"
          style={{ width: `${(currentStep / steps.length) * 100}%` }}
        />
      </div>

      <ol className="hidden items-start sm:flex">
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;

          return (
            <li key={step.id} className="flex min-w-0 flex-1 items-start">
              <div className="flex min-w-0 flex-col items-center text-center">
                <span
                  className={[
                    "flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors",
                    isCompleted
                      ? "border-[var(--color-brand-green)] bg-[var(--color-brand-green)] text-white"
                      : isCurrent
                        ? "border-[var(--color-brand-green)] bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)]"
                        : "border-neutral-200 bg-white text-neutral-400",
                  ].join(" ")}
                >
                  {isCompleted ? <Check className="h-4 w-4" /> : step.id}
                </span>
                <span
                  className={[
                    "mt-2 hidden text-xs font-semibold lg:block",
                    isCurrent || isCompleted ? "text-neutral-900" : "text-neutral-400",
                  ].join(" ")}
                >
                  {step.label}
                </span>
                <span
                  className={[
                    "mt-2 text-xs font-semibold lg:hidden",
                    isCurrent || isCompleted ? "text-neutral-900" : "text-neutral-400",
                  ].join(" ")}
                >
                  {step.shortLabel}
                </span>
              </div>

              {index < steps.length - 1 && (
                <div
                  className={[
                    "mx-2 mt-5 h-0.5 flex-1 rounded-full transition-colors",
                    currentStep > step.id ? "bg-[var(--color-brand-green)]" : "bg-neutral-200",
                  ].join(" ")}
                />
              )}
            </li>
          );
        })}
      </ol>

      <div className="mt-4 hidden rounded-2xl border border-neutral-200/80 bg-white px-5 py-4 shadow-soft sm:flex sm:items-center sm:gap-3">
        {(() => {
          const current = steps.find((step) => step.id === currentStep);
          if (!current) return null;
          const Icon = current.icon;
          return (
            <>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)]">
                <Icon className="h-4 w-4" />
              </span>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                  Etapa {currentStep} de {steps.length}
                </p>
                <p className="font-display text-lg font-bold text-neutral-900">{current.label}</p>
              </div>
            </>
          );
        })()}
      </div>
    </div>
  );
}
