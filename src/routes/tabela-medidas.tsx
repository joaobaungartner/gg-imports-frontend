import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/tabela-medidas")({
  component: TabelaMedidasPage,
});

const ADULT_SIZES = [
  { size: "P", chest: "88–92", length: "68–70", shoulder: "42–44" },
  { size: "M", chest: "96–100", length: "70–72", shoulder: "44–46" },
  { size: "G", chest: "104–108", length: "72–74", shoulder: "46–48" },
  { size: "GG", chest: "112–116", length: "74–76", shoulder: "48–50" },
  { size: "XGG", chest: "120–124", length: "76–78", shoulder: "50–52" },
] as const;

const KIDS_SIZES = [
  { size: "4", age: "3–4 anos", height: "98–104" },
  { size: "6", age: "5–6 anos", height: "110–116" },
  { size: "8", age: "7–8 anos", height: "122–128" },
  { size: "10", age: "9–10 anos", height: "134–140" },
  { size: "12", age: "11–12 anos", height: "146–152" },
] as const;

function TabelaMedidasPage() {
  return (
    <div className="section-canvas min-h-[70vh]">
      <div className="container-page py-12 lg:py-16">
        <div className="mx-auto max-w-4xl">
          <div className="mb-10 max-w-xl">
            <p className="eyebrow">Guia de tamanho</p>
            <h1 className="editorial-title mt-3 text-3xl sm:text-5xl">
              Tabela de <span className="editorial-serif">medidas</span>
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-[var(--color-muted)] sm:text-base">
              Medidas aproximadas em centímetros. Compare com uma camisa que você já use e, se
              ficar na dúvida, fale conosco antes de finalizar.
            </p>
          </div>

          <section className="surface-card overflow-hidden">
            <div className="border-b border-[var(--color-line)] bg-[var(--color-cream)] px-5 py-4">
              <h2 className="font-display text-lg font-bold text-[var(--color-ink)]">Adulto</h2>
              <p className="text-sm text-[var(--color-muted)]">Peito × comprimento × ombro (cm)</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[420px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-line)] text-[var(--color-muted)]">
                    <th className="px-5 py-3 font-semibold">Tamanho</th>
                    <th className="px-5 py-3 font-semibold">Peito</th>
                    <th className="px-5 py-3 font-semibold">Comprimento</th>
                    <th className="px-5 py-3 font-semibold">Ombro</th>
                  </tr>
                </thead>
                <tbody>
                  {ADULT_SIZES.map((row) => (
                    <tr key={row.size} className="border-b border-[var(--color-line)] last:border-0">
                      <td className="px-5 py-3 font-semibold text-[var(--color-forest)]">{row.size}</td>
                      <td className="px-5 py-3 text-[var(--color-ink)]">{row.chest}</td>
                      <td className="px-5 py-3 text-[var(--color-ink)]">{row.length}</td>
                      <td className="px-5 py-3 text-[var(--color-ink)]">{row.shoulder}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="surface-card mt-5 overflow-hidden">
            <div className="border-b border-[var(--color-line)] bg-[var(--color-cream)] px-5 py-4">
              <h2 className="font-display text-lg font-bold text-[var(--color-ink)]">Infantil</h2>
              <p className="text-sm text-[var(--color-muted)]">Referência por idade e altura (cm)</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[360px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-line)] text-[var(--color-muted)]">
                    <th className="px-5 py-3 font-semibold">Tamanho</th>
                    <th className="px-5 py-3 font-semibold">Idade</th>
                    <th className="px-5 py-3 font-semibold">Altura</th>
                  </tr>
                </thead>
                <tbody>
                  {KIDS_SIZES.map((row) => (
                    <tr key={row.size} className="border-b border-[var(--color-line)] last:border-0">
                      <td className="px-5 py-3 font-semibold text-[var(--color-forest)]">{row.size}</td>
                      <td className="px-5 py-3 text-[var(--color-ink)]">{row.age}</td>
                      <td className="px-5 py-3 text-[var(--color-ink)]">{row.height}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <p className="mt-6 text-sm text-[var(--color-muted)]">
            Player Version e modelos específicos podem cair um pouco mais justa. Em dúvida,{" "}
            <Link to="/" hash="contato" className="btn-ghost inline !p-0 font-semibold">
              fale conosco
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
