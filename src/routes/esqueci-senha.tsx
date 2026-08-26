import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { requestPasswordReset } from "@/lib/api";

export const Route = createFileRoute("/esqueci-senha")({ component: ForgotPasswordPage });

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const result = await requestPasswordReset(email);
    setMessage(result.message);
  }
  return <main className="page-shell py-16"><section className="mx-auto max-w-md card p-8"><h1 className="font-display text-3xl font-bold">Recuperar senha</h1><form onSubmit={submit} className="mt-6 space-y-4"><input className="field-input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com"/><button className="btn-primary w-full">Enviar instruções</button></form>{message && <p className="mt-4 text-sm text-muted">{message}</p>}<Link to="/login" className="btn-ghost mt-4 inline-flex">Voltar ao login</Link></section></main>;
}
