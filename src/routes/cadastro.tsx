import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import { registerClient } from "@/lib/api";
import {
  formatCpf,
  formatPhone,
  isValidCpf,
  isValidEmail,
  onlyDigits,
} from "@/lib/validators";

export const Route = createFileRoute("/cadastro")({
  component: CadastroPage,
});

function CadastroPage() {
  const navigate = useNavigate();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cpf, setCpf] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function validateForm(): string | null {
    if (!nome.trim()) return "Informe seu nome.";
    if (!email.trim()) return "Informe seu e-mail.";
    if (!isValidEmail(email)) return "Informe um e-mail válido.";
    if (!telefone.trim()) return "Informe seu telefone.";
    if (onlyDigits(telefone).length < 10) return "Informe um telefone válido.";
    if (!cpf.trim()) return "Informe seu CPF.";
    if (!isValidCpf(cpf)) return "Informe um CPF válido.";
    if (!senha) return "Informe uma senha.";
    if (senha.length < 6) return "A senha deve ter pelo menos 6 caracteres.";
    if (!confirmarSenha) return "Confirme sua senha.";
    if (senha !== confirmarSenha) return "As senhas não coincidem.";
    return null;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      await registerClient({
        nome: nome.trim(),
        email: email.trim(),
        telefone: onlyDigits(telefone),
        cpf: onlyDigits(cpf),
        senha,
      });
      await navigate({ to: "/login", search: { cadastro: "ok" } });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Não foi possível criar a conta.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container-page py-12 lg:py-16">
      <div className="mx-auto max-w-lg">
        <div className="mb-8 text-center">
          <h1 className="font-display text-3xl font-bold text-neutral-900">Criar conta</h1>
          <p className="mt-2 text-sm text-neutral-600">
            Cadastre-se para comprar camisas importadas com praticidade e segurança.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-soft sm:p-8"
        >
          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="nome" className="mb-1.5 block text-sm font-medium text-neutral-700">
                Nome
              </label>
              <input
                id="nome"
                type="text"
                autoComplete="name"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full rounded-xl border border-neutral-300 px-4 py-2.5 text-sm outline-none transition-colors focus:border-[var(--color-brand-green)] focus:ring-2 focus:ring-[var(--color-brand-green)]/20"
                placeholder="Seu nome completo"
              />
            </div>

            <div className="sm:col-span-2">
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
              <label htmlFor="telefone" className="mb-1.5 block text-sm font-medium text-neutral-700">
                Telefone
              </label>
              <input
                id="telefone"
                type="tel"
                autoComplete="tel"
                value={telefone}
                onChange={(e) => setTelefone(formatPhone(e.target.value))}
                className="w-full rounded-xl border border-neutral-300 px-4 py-2.5 text-sm outline-none transition-colors focus:border-[var(--color-brand-green)] focus:ring-2 focus:ring-[var(--color-brand-green)]/20"
                placeholder="(11) 99999-9999"
              />
            </div>

            <div>
              <label htmlFor="cpf" className="mb-1.5 block text-sm font-medium text-neutral-700">
                CPF
              </label>
              <input
                id="cpf"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                value={cpf}
                onChange={(e) => setCpf(formatCpf(e.target.value))}
                className="w-full rounded-xl border border-neutral-300 px-4 py-2.5 text-sm outline-none transition-colors focus:border-[var(--color-brand-green)] focus:ring-2 focus:ring-[var(--color-brand-green)]/20"
                placeholder="000.000.000-00"
              />
            </div>

            <div>
              <label htmlFor="senha" className="mb-1.5 block text-sm font-medium text-neutral-700">
                Senha
              </label>
              <input
                id="senha"
                type="password"
                autoComplete="new-password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="w-full rounded-xl border border-neutral-300 px-4 py-2.5 text-sm outline-none transition-colors focus:border-[var(--color-brand-green)] focus:ring-2 focus:ring-[var(--color-brand-green)]/20"
                placeholder="Mínimo 6 caracteres"
              />
            </div>

            <div>
              <label
                htmlFor="confirmarSenha"
                className="mb-1.5 block text-sm font-medium text-neutral-700"
              >
                Confirmar senha
              </label>
              <input
                id="confirmarSenha"
                type="password"
                autoComplete="new-password"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                className="w-full rounded-xl border border-neutral-300 px-4 py-2.5 text-sm outline-none transition-colors focus:border-[var(--color-brand-green)] focus:ring-2 focus:ring-[var(--color-brand-green)]/20"
                placeholder="Repita a senha"
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
                Criando conta...
              </>
            ) : (
              "Cadastrar"
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-neutral-600">
          Já tem conta?{" "}
          <Link to="/login" className="font-semibold text-[var(--color-brand-green)] hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
