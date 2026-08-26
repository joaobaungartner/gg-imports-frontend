import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { resetPassword } from "@/lib/api";

export const Route = createFileRoute("/redefinir-senha")({ validateSearch: (search: Record<string, unknown>) => ({ token: typeof search.token === "string" ? search.token : "" }), component: ResetPasswordPage });
function ResetPasswordPage() {
  const { token } = Route.useSearch(); const [password, setPassword] = useState(""); const [message, setMessage] = useState("");
  async function submit(event: React.FormEvent) { event.preventDefault(); try { setMessage((await resetPassword(token, password)).message); } catch { setMessage("Link inválido ou expirado."); } }
  return <main className="page-shell py-16"><section className="mx-auto max-w-md card p-8"><h1 className="font-display text-3xl font-bold">Nova senha</h1><form onSubmit={submit} className="mt-6 space-y-4"><input className="field-input" type="password" minLength={8} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo de 8 caracteres"/><button className="btn-primary w-full">Alterar senha</button></form>{message && <p className="mt-4 text-sm text-muted">{message}</p>}<Link to="/login" className="btn-ghost mt-4 inline-flex">Entrar</Link></section></main>;
}
