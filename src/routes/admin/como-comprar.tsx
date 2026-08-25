import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowDown, ArrowUp, Loader2, Plus, Save, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getToken } from "@/lib/auth";
import {
  ApiError,
  getHowToBuyContent,
  updateHowToBuyContent,
  type HowToBuyContent,
  type HowToBuyStep,
} from "@/lib/api";
import { isTokenExpired } from "@/utils/authToken";

export const Route = createFileRoute("/admin/como-comprar")({
  component: AdminComoComprarPage,
});

function AdminComoComprarPage() {
  const navigate = useNavigate();
  const { isAdmin, isAuthenticated } = useAuth();

  const [content, setContent] = useState<HowToBuyContent | null>(null);
  const [draft, setDraft] = useState<HowToBuyContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isDirty = useMemo(() => {
    if (!content || !draft) return false;
    return JSON.stringify(content) !== JSON.stringify(draft);
  }, [content, draft]);

  useEffect(() => {
    const token = getToken();
    if (!token || isTokenExpired(token)) {
      navigate({ to: "/login", search: { session: "expired" } });
      return;
    }
    if (!isAuthenticated) {
      navigate({ to: "/login" });
      return;
    }
    if (!isAdmin) {
      navigate({ to: "/" });
    }
  }, [isAuthenticated, isAdmin, navigate]);

  useEffect(() => {
    const handler = (event: BeforeUnloadEvent) => {
      if (!isDirty) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getHowToBuyContent();
      setContent(data);
      setDraft(structuredClone(data));
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Não foi possível carregar o conteúdo.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) return;
    void load();
  }, [isAuthenticated, isAdmin, load]);

  function updateField<K extends keyof HowToBuyContent>(key: K, value: HowToBuyContent[K]) {
    setDraft((prev) => (prev ? { ...prev, [key]: value } : prev));
    setSuccess("");
  }

  function updateStep(index: number, patch: Partial<HowToBuyStep>) {
    setDraft((prev) => {
      if (!prev) return prev;
      const steps = prev.steps.map((step, i) => (i === index ? { ...step, ...patch } : step));
      return { ...prev, steps };
    });
    setSuccess("");
  }

  function addStep() {
    setDraft((prev) => {
      if (!prev) return prev;
      if (prev.steps.length >= 20) return prev;
      return {
        ...prev,
        steps: [...prev.steps, { title: "Nova etapa", description: "Descreva esta etapa." }],
      };
    });
    setSuccess("");
  }

  function removeStep(index: number) {
    setDraft((prev) => {
      if (!prev || prev.steps.length <= 1) return prev;
      return { ...prev, steps: prev.steps.filter((_, i) => i !== index) };
    });
    setSuccess("");
  }

  function moveStep(index: number, direction: -1 | 1) {
    setDraft((prev) => {
      if (!prev) return prev;
      const target = index + direction;
      if (target < 0 || target >= prev.steps.length) return prev;
      const steps = [...prev.steps];
      const [item] = steps.splice(index, 1);
      steps.splice(target, 0, item);
      return { ...prev, steps };
    });
    setSuccess("");
  }

  function handleCancel() {
    if (!content) return;
    if (isDirty && !window.confirm("Descartar alterações não salvas?")) return;
    setDraft(structuredClone(content));
    setSuccess("");
    setError("");
  }

  async function handleSave() {
    if (!draft) return;
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const updated = await updateHowToBuyContent({
        title: draft.title.trim(),
        subtitle: draft.subtitle.trim(),
        eyebrow: draft.eyebrow.trim() || "Passo a passo",
        steps: draft.steps.map((step) => ({
          title: step.title.trim(),
          description: step.description.trim(),
        })),
      });
      setContent(updated);
      setDraft(structuredClone(updated));
      setSuccess("Conteúdo salvo com sucesso.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Falha ao salvar o conteúdo.");
    } finally {
      setSaving(false);
    }
  }

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return (
    <div className="section-canvas min-h-[70vh]">
      <div className="container-page py-10 lg:py-14">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Administração</p>
            <h1 className="editorial-title mt-2 text-3xl sm:text-4xl">Editar Como comprar</h1>
            <p className="mt-2 max-w-2xl text-sm text-[var(--color-muted)]">
              Atualize o conteúdo exibido na página pública. As alterações só aparecem após salvar.
            </p>
          </div>
          <Link to="/como-comprar" className="btn-secondary">
            Visualizar página pública
          </Link>
        </div>

        {loading || !draft ? (
          <div className="surface-card flex flex-col items-center justify-center gap-3 px-6 py-16 text-[var(--color-muted)]">
            <Loader2 className="h-6 w-6 animate-spin text-[var(--color-forest)]" />
            <p className="text-sm font-medium">Carregando editor…</p>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-4">
              <div className="surface-card space-y-4 p-5">
                <div>
                  <label htmlFor="htb-eyebrow" className="field-label">
                    Eyebrow
                  </label>
                  <input
                    id="htb-eyebrow"
                    className="field-input"
                    value={draft.eyebrow}
                    maxLength={80}
                    onChange={(e) => updateField("eyebrow", e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="htb-title" className="field-label">
                    Título
                  </label>
                  <input
                    id="htb-title"
                    className="field-input"
                    value={draft.title}
                    maxLength={120}
                    onChange={(e) => updateField("title", e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="htb-subtitle" className="field-label">
                    Introdução
                  </label>
                  <textarea
                    id="htb-subtitle"
                    className="field-input min-h-24"
                    value={draft.subtitle}
                    maxLength={500}
                    onChange={(e) => updateField("subtitle", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-3">
                {draft.steps.map((step, index) => (
                  <div key={`step-${index}`} className="surface-card space-y-3 p-5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-[var(--color-ink)]">
                        Etapa {index + 1}
                      </p>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          className="btn-ghost !px-2"
                          onClick={() => moveStep(index, -1)}
                          disabled={index === 0}
                          aria-label="Mover para cima"
                        >
                          <ArrowUp className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          className="btn-ghost !px-2"
                          onClick={() => moveStep(index, 1)}
                          disabled={index === draft.steps.length - 1}
                          aria-label="Mover para baixo"
                        >
                          <ArrowDown className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          className="btn-ghost !px-2 text-[var(--color-danger)]"
                          onClick={() => removeStep(index)}
                          disabled={draft.steps.length <= 1}
                          aria-label="Remover etapa"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="field-label" htmlFor={`step-title-${index}`}>
                        Título da etapa
                      </label>
                      <input
                        id={`step-title-${index}`}
                        className="field-input"
                        value={step.title}
                        maxLength={120}
                        onChange={(e) => updateStep(index, { title: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="field-label" htmlFor={`step-desc-${index}`}>
                        Descrição
                      </label>
                      <textarea
                        id={`step-desc-${index}`}
                        className="field-input min-h-24"
                        value={step.description}
                        maxLength={1000}
                        onChange={(e) => updateStep(index, { description: e.target.value })}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={addStep}
                  disabled={draft.steps.length >= 20}
                >
                  <Plus className="h-4 w-4" />
                  Adicionar etapa
                </button>
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={handleCancel}
                  disabled={!isDirty || saving}
                >
                  Cancelar alterações
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => void handleSave()}
                  disabled={!isDirty || saving}
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Salvar alterações
                </button>
              </div>

              {success ? (
                <div className="alert-success" role="status">
                  {success}
                </div>
              ) : null}
              {error ? (
                <div className="alert-error" role="alert">
                  {error}
                </div>
              ) : null}
            </div>

            <div className="surface-card h-fit p-6">
              <p className="eyebrow">Pré-visualização</p>
              <h2 className="editorial-title mt-3 text-3xl">{draft.title}</h2>
              <p className="mt-3 text-sm text-[var(--color-muted)]">{draft.subtitle}</p>
              <div className="mt-6 space-y-4">
                {draft.steps.map((step, index) => (
                  <div key={`preview-${index}`} className="border-b border-[var(--color-line)] pb-4">
                    <p className="font-serif text-2xl italic text-[var(--color-forest-mid)]">
                      {String(index + 1).padStart(2, "0")}
                    </p>
                    <p className="mt-2 font-semibold text-[var(--color-ink)]">{step.title}</p>
                    <p className="mt-1 text-sm text-[var(--color-muted)]">{step.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
