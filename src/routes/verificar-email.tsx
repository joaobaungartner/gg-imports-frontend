import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { verifyEmail } from "@/lib/api";

export const Route = createFileRoute("/verificar-email")({ validateSearch: (search: Record<string, unknown>) => ({ token: typeof search.token === "string" ? search.token : "" }), component: VerifyEmailPage });
function VerifyEmailPage() { const { token } = Route.useSearch(); const [message, setMessage] = useState("Verificando..."); useEffect(() => { verifyEmail(token).then((r) => setMessage(r.message)).catch(() => setMessage("Link inválido ou expirado.")); }, [token]); return <main className="page-shell py-16"><section className="mx-auto max-w-md card p-8"><h1 className="font-display text-3xl font-bold">Verificação de e-mail</h1><p className="mt-4 text-muted">{message}</p><Link to="/login" className="btn-primary mt-6 inline-flex">Continuar</Link></section></main>; }
