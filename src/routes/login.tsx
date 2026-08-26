import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { login } from "@/lib/api";
import { resolveRedirectPath } from "@/lib/authRedirect";
import { isValidEmail } from "@/lib/validators";

type LoginSearch = {
  cadastro?: string;
  session?: string;
  redirect?: string;
};

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>): LoginSearch => ({
    cadastro: typeof search.cadastro === "string" ? search.cadastro : undefined,
    session: typeof search.session === "string" ? search.session : undefined,
    redirect: typeof search.redirect === "string" ? search.redirect : undefined,
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { login: setAuth } = useAuth();
  const { cadastro, session, redirect } = Route.useSearch();
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
      const destination = resolveRedirectPath(redirect);
      await navigate({ to: destination });
    } catch {
      setError("E-mail ou senha incorretos.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="section-canvas min-h-[70vh]">
      <div className="container-page py-12 lg:py-16">
        <div className="mx-auto max-w-md">
          <div className="mb-8 text-center">
            <p className="eyebrow justify-center">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-lime)]" />
              Conta GG Imports
            </p>
            <h1 className="editorial-title mt-3 text-3xl sm:text-4xl">
              Entrar na <span className="editorial-serif">sua conta</span>
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-[var(--color-muted)]">
              {redirect === "/checkout"
                ? "Faça login para continuar com a finalização do seu pedido."
                : "Acesse sua conta para acompanhar pedidos e comprar com mais facilidade."}
            </p>
          </div>

          {session === "expired" && (
            <div className="alert-error mb-6" role="status">
              Sua sessão expirou. Faça login novamente.
            </div>
          )}

          {cadastro === "ok" && (
            <div className="alert-success mb-6" role="status">
              Conta criada com sucesso! Faça login para continuar.
            </div>
          )}

          <form onSubmit={handleSubmit} className="surface-card p-6 sm:p-8">
            {error && (
              <div className="alert-error mb-4" role="alert">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="field-label">
                  E-mail
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="field-input"
                  placeholder="seu@email.com"
                />
              </div>

              <div>
                <label htmlFor="senha" className="field-label">
                  Senha
                </label>
                <Link to="/esqueci-senha" className="text-sm font-semibold text-forest hover:underline">Esqueci minha senha</Link>
                <input
                  id="senha"
                  type="password"
                  autoComplete="current-password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="field-input"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary mt-6 w-full">
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

          <p className="mt-6 text-center text-sm text-[var(--color-muted)]">
            Ainda não tem conta?{" "}
            <Link to="/cadastro" className="btn-ghost inline !p-0 font-semibold">
              Cadastre-se
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
