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
        <p className="text-sm font-medium text-[var(--color-ink)]">
          Etapa {currentStep} de {steps.length}
        </p>
        <p className="text-sm text-[var(--color-muted)]">
          {steps.find((step) => step.id === currentStep)?.label}
        </p>
      </div>

      <div className="h-1.5 overflow-hidden rounded-[4px] bg-[var(--color-cream)] sm:hidden">
        <div
          className="h-full rounded-[4px] bg-[var(--color-forest)] transition-all duration-300"
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
                    "flex h-10 w-10 items-center justify-center rounded-[4px] border-2 text-sm font-semibold transition-colors",
                    isCompleted
                      ? "border-[var(--color-forest)] bg-[var(--color-forest)] text-white"
                      : isCurrent
                        ? "border-[var(--color-forest)] bg-[var(--color-lime)]/25 text-[var(--color-forest)]"
                        : "border-[var(--color-line)] bg-white text-[var(--color-muted)]",
                  ].join(" ")}
                >
                  {isCompleted ? <Check className="h-4 w-4" /> : step.id}
                </span>
                <span
                  className={[
                    "mt-2 hidden text-xs font-semibold lg:block",
                    isCurrent || isCompleted ? "text-[var(--color-ink)]" : "text-[var(--color-muted)]",
                  ].join(" ")}
                >
                  {step.label}
                </span>
                <span
                  className={[
                    "mt-2 text-xs font-semibold lg:hidden",
                    isCurrent || isCompleted ? "text-[var(--color-ink)]" : "text-[var(--color-muted)]",
                  ].join(" ")}
                >
                  {step.shortLabel}
                </span>
              </div>

              {index < steps.length - 1 && (
                <div
                  className={[
                    "mx-2 mt-5 h-0.5 flex-1 rounded-[4px] transition-colors",
                    currentStep > step.id ? "bg-[var(--color-forest)]" : "bg-[var(--color-line)]",
                  ].join(" ")}
                />
              )}
            </li>
          );
        })}
      </ol>

      <div className="surface-card mt-4 hidden px-5 py-4 sm:flex sm:items-center sm:gap-3">
        {(() => {
          const current = steps.find((step) => step.id === currentStep);
          if (!current) return null;
          const Icon = current.icon;
          return (
            <>
              <span className="flex h-9 w-9 items-center justify-center rounded-[4px] bg-[var(--color-cream)] text-[var(--color-forest)]">
                <Icon className="h-4 w-4" />
              </span>
              <div>
                <p className="eyebrow !gap-0">
                  Etapa {currentStep} de {steps.length}
                </p>
                <p className="editorial-title mt-0.5 text-lg">{current.label}</p>
              </div>
            </>
          );
        })()}
      </div>
    </div>
  );
}
