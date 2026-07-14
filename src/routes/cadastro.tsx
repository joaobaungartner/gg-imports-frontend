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
    <div className="section-canvas min-h-[70vh]">
      <div className="container-page py-12 lg:py-16">
        <div className="mx-auto max-w-lg">
          <div className="mb-8 text-center">
            <p className="eyebrow justify-center">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-lime)]" />
              Novo cliente
            </p>
            <h1 className="editorial-title mt-3 text-3xl sm:text-4xl">
              Criar <span className="editorial-serif">conta</span>
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-[var(--color-muted)]">
              Cadastre-se para comprar camisas importadas com praticidade e segurança.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="surface-card p-6 sm:p-8">
            {error && (
              <div className="alert-error mb-4" role="alert">
                {error}
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="nome" className="field-label">
                  Nome
                </label>
                <input
                  id="nome"
                  type="text"
                  autoComplete="name"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="field-input"
                  placeholder="Seu nome completo"
                />
              </div>

              <div className="sm:col-span-2">
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
                <label htmlFor="telefone" className="field-label">
                  Telefone
                </label>
                <input
                  id="telefone"
                  type="tel"
                  autoComplete="tel"
                  value={telefone}
                  onChange={(e) => setTelefone(formatPhone(e.target.value))}
                  className="field-input"
                  placeholder="(11) 99999-9999"
                />
              </div>

              <div>
                <label htmlFor="cpf" className="field-label">
                  CPF
                </label>
                <input
                  id="cpf"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  value={cpf}
                  onChange={(e) => setCpf(formatCpf(e.target.value))}
                  className="field-input"
                  placeholder="000.000.000-00"
                />
              </div>

              <div>
                <label htmlFor="senha" className="field-label">
                  Senha
                </label>
                <input
                  id="senha"
                  type="password"
                  autoComplete="new-password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="field-input"
                  placeholder="Mínimo 6 caracteres"
                />
              </div>

              <div>
                <label htmlFor="confirmarSenha" className="field-label">
                  Confirmar senha
                </label>
                <input
                  id="confirmarSenha"
                  type="password"
                  autoComplete="new-password"
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  className="field-input"
                  placeholder="Repita a senha"
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary mt-6 w-full">
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

          <p className="mt-6 text-center text-sm text-[var(--color-muted)]">
            Já tem conta?{" "}
            <Link to="/login" className="btn-ghost inline !p-0 font-semibold">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
