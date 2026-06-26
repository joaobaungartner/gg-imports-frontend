import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { login } from "@/lib/api";
import { isValidEmail } from "@/lib/validators";

type LoginSearch = {
  cadastro?: string;
};

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>): LoginSearch => ({
    cadastro: typeof search.cadastro === "string" ? search.cadastro : undefined,
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { login: setAuth } = useAuth();
  const { cadastro } = Route.useSearch();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");

    if (!email.trim() || !senha) {
      setError("Preencha e-mail e senha.");
      return;
    }

    if (!isValidEmail(email)) {
      setError("Informe um e-mail válido.");
      return;
    }

    setLoading(true);
    try {
      const response = await login({ email: email.trim(), senha });
      setAuth(response);
      await navigate({ to: "/" });
    } catch {
      setError("E-mail ou senha incorretos.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container-page py-12 lg:py-16">
      <div className="mx-auto max-w-md">
        <div className="mb-8 text-center">
          <h1 className="font-display text-3xl font-bold text-neutral-900">Entrar</h1>
          <p className="mt-2 text-sm text-neutral-600">
            Acesse sua conta para acompanhar pedidos e comprar com mais facilidade.
          </p>
        </div>

        {cadastro === "ok" && (
          <div className="mb-6 rounded-xl border border-[var(--color-brand-green)]/20 bg-[var(--color-brand-green)]/5 px-4 py-3 text-sm text-[var(--color-brand-green)]">
            Conta criada com sucesso! Faça login para continuar.
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-soft sm:p-8"
        >
          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-neutral-700">
                E-mail
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-neutral-300 px-4 py-2.5 text-sm outline-none transition-colors focus:border-[var(--color-brand-green)] focus:ring-2 focus:ring-[var(--color-brand-green)]/20"
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <label htmlFor="senha" className="mb-1.5 block text-sm font-medium text-neutral-700">
                Senha
              </label>
              <input
                id="senha"
                type="password"
                autoComplete="current-password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="w-full rounded-xl border border-neutral-300 px-4 py-2.5 text-sm outline-none transition-colors focus:border-[var(--color-brand-green)] focus:ring-2 focus:ring-[var(--color-brand-green)]/20"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[var(--color-brand-green)] px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Entrando...
              </>
            ) : (
              "Entrar"
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-neutral-600">
          Ainda não tem conta?{" "}
          <Link to="/cadastro" className="font-semibold text-[var(--color-brand-green)] hover:underline">
            Cadastre-se
          </Link>
        </p>
      </div>
    </div>
  );
}
