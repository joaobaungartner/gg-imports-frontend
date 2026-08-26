import { createFileRoute, Navigate } from "@tanstack/react-router";
import { BadgeCheck, KeyRound, Loader2, Mail, MapPin, Save, UserRound } from "lucide-react";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { changePassword, createAddress, getAuthMe, requestEmailVerification, updateUser, type AuthMeResponse } from "@/lib/api";

export const Route = createFileRoute("/minha-conta")({ component: AccountPage });

function AccountPage() {
  const { isAuthenticated } = useAuth();
  const [profile, setProfile] = useState<AuthMeResponse | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState<string | null>(null);
  const [passwords, setPasswords] = useState({ atual: "", nova: "" });

  useEffect(() => {
    if (isAuthenticated) getAuthMe().then(setProfile).catch((err) => setError(err instanceof Error ? err.message : "Não foi possível carregar sua conta."));
  }, [isAuthenticated]);

  if (!isAuthenticated) return <Navigate to="/login" search={{ redirect: "/minha-conta" }} />;
  if (!profile && !error) return <main className="section-canvas"><div className="container-page flex min-h-[55vh] items-center justify-center gap-3 text-[var(--color-muted)]"><Loader2 className="h-5 w-5 animate-spin" />Carregando sua conta…</div></main>;

  async function run(key: string, action: () => Promise<void>) {
    setSaving(key); setMessage(""); setError("");
    try { await action(); } catch (err) { setError(err instanceof Error ? err.message : "Não foi possível salvar a alteração."); }
    finally { setSaving(null); }
  }

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const data = new FormData(event.currentTarget);
    await run("profile", async () => {
      await updateUser(profile!.id, { nome: String(data.get("nome")), telefone: String(data.get("telefone")) });
      setProfile(await getAuthMe()); setMessage("Perfil atualizado com sucesso.");
    });
  }

  async function addAddress(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = event.currentTarget; const data = new FormData(form);
    if (!profile!.client_id) return;
    await run("address", async () => {
      await createAddress({ client_id: profile!.client_id!, rua: String(data.get("rua")), numero: String(data.get("numero")), bairro: String(data.get("bairro")), cidade: String(data.get("cidade")), estado: String(data.get("estado")).toUpperCase(), cep: String(data.get("cep")) });
      setProfile(await getAuthMe()); form.reset(); setMessage("Endereço salvo com sucesso.");
    });
  }

  if (!profile) return <main className="section-canvas"><div className="container-page py-16"><p className="alert-error">{error}</p></div></main>;

  return <main className="section-canvas"><div className="container-page py-10 sm:py-14 lg:py-16">
    <header className="max-w-2xl"><p className="eyebrow"><UserRound className="h-4 w-4" />Área do cliente</p><h1 className="editorial-title mt-3 text-4xl sm:text-5xl">Minha conta</h1><p className="mt-4 text-sm leading-relaxed text-[var(--color-muted)] sm:text-base">Mantenha seus dados atualizados para agilizar compras, entregas e o acompanhamento dos pedidos.</p></header>
    <div className="mt-7 min-h-12">{message && <p className="alert-success">{message}</p>}{error && <p className="alert-error">{error}</p>}</div>

    <div className="mt-2 grid items-start gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(22rem,.95fr)]">
      <div className="space-y-6">
        <form onSubmit={saveProfile} className="surface-card p-5 sm:p-7">
          <SectionTitle icon={<UserRound className="h-5 w-5" />} title="Dados pessoais" subtitle="Informações usadas nos seus pedidos" />
          <div className="mt-5 grid gap-4 sm:grid-cols-2"><Field label="Nome completo" wide><input className="field-input" name="nome" defaultValue={profile.nome} required /></Field><Field label="E-mail"><input className="field-input" value={profile.email} readOnly /></Field><Field label="Telefone"><input className="field-input" name="telefone" defaultValue={profile.telefone ?? ""} placeholder="(11) 99999-9999" /></Field></div>
          <div className="mt-5 flex flex-wrap items-center gap-3"><button className="btn-primary" disabled={saving === "profile"}><Save className="h-4 w-4" />{saving === "profile" ? "Salvando…" : "Salvar perfil"}</button>{profile.email_verificado ? <span className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-forest-mid)]"><BadgeCheck className="h-4 w-4" />E-mail verificado</span> : <button type="button" className="btn-secondary" disabled={saving === "email"} onClick={() => void run("email", async () => { const result = await requestEmailVerification(); setMessage(result.message); })}><Mail className="h-4 w-4" />Verificar e-mail</button>}</div>
        </form>

        <form onSubmit={(event) => { event.preventDefault(); void run("password", async () => { const result = await changePassword(passwords.atual, passwords.nova); setPasswords({ atual: "", nova: "" }); setMessage(result.message); }); }} className="surface-card p-5 sm:p-7">
          <SectionTitle icon={<KeyRound className="h-5 w-5" />} title="Segurança" subtitle="Use pelo menos 8 caracteres" />
          <div className="mt-5 grid gap-4 sm:grid-cols-2"><Field label="Senha atual"><input className="field-input" type="password" autoComplete="current-password" required value={passwords.atual} onChange={(e) => setPasswords({ ...passwords, atual: e.target.value })} /></Field><Field label="Nova senha"><input className="field-input" type="password" autoComplete="new-password" minLength={8} required value={passwords.nova} onChange={(e) => setPasswords({ ...passwords, nova: e.target.value })} /></Field></div>
          <button className="btn-primary mt-5" disabled={saving === "password"}><KeyRound className="h-4 w-4" />{saving === "password" ? "Alterando…" : "Alterar senha"}</button>
        </form>
      </div>

      <div className="space-y-6">
        {profile.endereco && <section className="surface-card overflow-hidden"><div className="bg-[var(--color-forest)] p-5 text-white sm:p-6"><MapPin className="h-5 w-5 text-[var(--color-lime)]" /><h2 className="font-display mt-3 text-2xl font-bold">Endereço atual</h2></div><address className="p-5 text-sm not-italic leading-7 text-[var(--color-muted)] sm:p-6"><strong className="text-[var(--color-ink)]">{profile.endereco.rua}, {profile.endereco.numero}</strong><br />{profile.endereco.bairro}<br />{profile.endereco.cidade} / {profile.endereco.estado}<br />CEP {profile.endereco.cep}</address></section>}
        <form onSubmit={addAddress} className="surface-card p-5 sm:p-7">
          <SectionTitle icon={<MapPin className="h-5 w-5" />} title={profile.endereco ? "Novo endereço" : "Endereço de entrega"} subtitle="Preencha os dados completos" />
          <div className="mt-5 grid gap-4 sm:grid-cols-6"><Field label="Rua" span="sm:col-span-4"><input required className="field-input" name="rua" placeholder="Rua ou avenida" /></Field><Field label="Número" span="sm:col-span-2"><input required className="field-input" name="numero" placeholder="123" /></Field><Field label="Bairro" span="sm:col-span-3"><input required className="field-input" name="bairro" /></Field><Field label="Cidade" span="sm:col-span-3"><input required className="field-input" name="cidade" /></Field><Field label="Estado" span="sm:col-span-2"><input required maxLength={2} className="field-input uppercase" name="estado" placeholder="SP" /></Field><Field label="CEP" span="sm:col-span-4"><input required inputMode="numeric" className="field-input" name="cep" placeholder="00000-000" /></Field></div>
          <button className="btn-primary mt-5 w-full" disabled={saving === "address"}><MapPin className="h-4 w-4" />{saving === "address" ? "Salvando…" : profile.endereco ? "Adicionar novo endereço" : "Salvar endereço"}</button>
        </form>
      </div>
    </div>
  </div></main>;
}

function SectionTitle({ icon, title, subtitle }: { icon: ReactNode; title: string; subtitle: string }) {
  return <div className="flex items-center gap-3 border-b border-[var(--color-line)] pb-5"><span className="rounded-full bg-[var(--color-cream)] p-2.5 text-[var(--color-forest)]">{icon}</span><div><h2 className="editorial-title text-2xl">{title}</h2><p className="mt-1 text-xs text-[var(--color-muted)]">{subtitle}</p></div></div>;
}

function Field({ label, children, wide, span }: { label: string; children: ReactNode; wide?: boolean; span?: string }) {
  return <label className={wide ? "sm:col-span-2" : span}><span className="field-label">{label}</span>{children}</label>;
}
