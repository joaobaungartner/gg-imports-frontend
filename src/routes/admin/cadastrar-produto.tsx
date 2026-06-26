import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Loader2, PackagePlus } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { createProduct, listCategories, type Category } from "@/lib/api";

export const Route = createFileRoute("/admin/cadastrar-produto")({
  component: CadastrarProdutoPage,
});

const TAMANHOS = ["P", "M", "G", "GG", "XGG"] as const;
const TIPOS = ["Fan", "Player Version", "Retrô", "Infantil", "Treino"] as const;

function CadastrarProdutoPage() {
  const navigate = useNavigate();
  const { isAdmin, isAuthenticated } = useAuth();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [categoryId, setCategoryId] = useState("");
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [preco, setPreco] = useState("");
  const [tamanhos, setTamanhos] = useState<string[]>([]);
  const [clube, setClube] = useState("");
  const [tipo, setTipo] = useState("");
  const [estoque, setEstoque] = useState("");
  const [imagemUrl, setImagemUrl] = useState("");
  const [ativo, setAtivo] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: "/login" });
      return;
    }
    if (!isAdmin) {
      navigate({ to: "/" });
    }
  }, [isAuthenticated, isAdmin, navigate]);

  useEffect(() => {
    listCategories()
      .then(setCategories)
      .catch(() => setError("Não foi possível carregar as categorias."))
      .finally(() => setLoadingCategories(false));
  }, []);

  function validateForm(): string | null {
    if (!categoryId) return "Selecione uma categoria.";
    if (!nome.trim()) return "Informe o nome do produto.";
    if (!clube.trim()) return "Informe o clube.";
    if (!tipo) return "Selecione o tipo.";
    if (tamanhos.length === 0) return "Selecione pelo menos um tamanho.";
    if (!preco || Number(preco) <= 0) return "Informe um preço válido.";
    if (estoque === "" || Number(estoque) < 0) return "Informe um estoque válido.";
    return null;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        category_id: Number(categoryId),
        nome: nome.trim(),
        descricao: descricao.trim() || undefined,
        preco: Number(preco),
        clube: clube.trim(),
        tipo,
        estoque: Number(estoque),
        imagem_url: imagemUrl.trim() || undefined,
        ativo,
      };

      await Promise.all(
        tamanhos.map((tamanho) => createProduct({ ...payload, tamanho })),
      );

      const tamanhosLabel = tamanhos.join(", ");
      setSuccess(
        tamanhos.length === 1
          ? "Produto cadastrado com sucesso!"
          : `Produto cadastrado em ${tamanhos.length} tamanhos (${tamanhosLabel})!`,
      );
      setNome("");
      setDescricao("");
      setPreco("");
      setClube("");
      setEstoque("");
      setImagemUrl("");
      setTamanhos([]);
      setTipo("");
      setCategoryId("");
      setAtivo(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Não foi possível cadastrar o produto.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return (
    <div className="container-page py-12 lg:py-16">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-brand-green)] text-white">
              <PackagePlus className="h-5 w-5" />
            </span>
            <div>
              <h1 className="font-display text-3xl font-bold text-neutral-900">Cadastrar produto</h1>
              <p className="mt-1 text-sm text-neutral-600">Área administrativa — adicione novos produtos ao catálogo.</p>
            </div>
          </div>
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

          {success && (
            <div className="mb-4 rounded-lg border border-[var(--color-brand-green)]/20 bg-[var(--color-brand-green)]/5 px-4 py-3 text-sm text-[var(--color-brand-green)]">
              {success}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="nome" className="mb-1.5 block text-sm font-medium text-neutral-700">
                Nome do produto
              </label>
              <input
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full rounded-xl border border-neutral-300 px-4 py-2.5 text-sm outline-none focus:border-[var(--color-brand-green)] focus:ring-2 focus:ring-[var(--color-brand-green)]/20"
                placeholder="Ex: Flamengo Home 24/25"
              />
            </div>

            <div>
              <label htmlFor="clube" className="mb-1.5 block text-sm font-medium text-neutral-700">
                Clube
              </label>
              <input
                id="clube"
                value={clube}
                onChange={(e) => setClube(e.target.value)}
                className="w-full rounded-xl border border-neutral-300 px-4 py-2.5 text-sm outline-none focus:border-[var(--color-brand-green)] focus:ring-2 focus:ring-[var(--color-brand-green)]/20"
                placeholder="Ex: Flamengo"
              />
            </div>

            <div>
              <label htmlFor="category" className="mb-1.5 block text-sm font-medium text-neutral-700">
                Categoria
              </label>
              <select
                id="category"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                disabled={loadingCategories}
                className="w-full rounded-xl border border-neutral-300 px-4 py-2.5 text-sm outline-none focus:border-[var(--color-brand-green)] focus:ring-2 focus:ring-[var(--color-brand-green)]/20"
              >
                <option value="">Selecione...</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nome}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="tipo" className="mb-1.5 block text-sm font-medium text-neutral-700">
                Tipo
              </label>
              <select
                id="tipo"
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                className="w-full rounded-xl border border-neutral-300 px-4 py-2.5 text-sm outline-none focus:border-[var(--color-brand-green)] focus:ring-2 focus:ring-[var(--color-brand-green)]/20"
              >
                <option value="">Selecione...</option>
                {TIPOS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <span className="mb-2 block text-sm font-medium text-neutral-700">
                Tamanhos disponíveis
              </span>
              <div className="flex flex-wrap gap-2">
                {TAMANHOS.map((t) => {
                  const selected = tamanhos.includes(t);
                  return (
                    <label
                      key={t}
                      className={`inline-flex cursor-pointer items-center rounded-xl border px-4 py-2 text-sm font-medium transition-colors ${
                        selected
                          ? "border-[var(--color-brand-green)] bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)]"
                          : "border-neutral-300 text-neutral-700 hover:border-neutral-400"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() =>
                          setTamanhos((prev) =>
                            selected ? prev.filter((size) => size !== t) : [...prev, t],
                          )
                        }
                        className="sr-only"
                      />
                      {t}
                    </label>
                  );
                })}
              </div>
            </div>

            <div>
              <label htmlFor="preco" className="mb-1.5 block text-sm font-medium text-neutral-700">
                Preço (R$)
              </label>
              <input
                id="preco"
                type="number"
                min="0.01"
                step="0.01"
                value={preco}
                onChange={(e) => setPreco(e.target.value)}
                className="w-full rounded-xl border border-neutral-300 px-4 py-2.5 text-sm outline-none focus:border-[var(--color-brand-green)] focus:ring-2 focus:ring-[var(--color-brand-green)]/20"
                placeholder="249.90"
              />
            </div>

            <div>
              <label htmlFor="estoque" className="mb-1.5 block text-sm font-medium text-neutral-700">
                Estoque
              </label>
              <input
                id="estoque"
                type="number"
                min="0"
                step="1"
                value={estoque}
                onChange={(e) => setEstoque(e.target.value)}
                className="w-full rounded-xl border border-neutral-300 px-4 py-2.5 text-sm outline-none focus:border-[var(--color-brand-green)] focus:ring-2 focus:ring-[var(--color-brand-green)]/20"
                placeholder="10"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="imagemUrl" className="mb-1.5 block text-sm font-medium text-neutral-700">
                URL da imagem (opcional)
              </label>
              <input
                id="imagemUrl"
                type="url"
                value={imagemUrl}
                onChange={(e) => setImagemUrl(e.target.value)}
                className="w-full rounded-xl border border-neutral-300 px-4 py-2.5 text-sm outline-none focus:border-[var(--color-brand-green)] focus:ring-2 focus:ring-[var(--color-brand-green)]/20"
                placeholder="https://..."
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="descricao" className="mb-1.5 block text-sm font-medium text-neutral-700">
                Descrição (opcional)
              </label>
              <textarea
                id="descricao"
                rows={3}
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                className="w-full rounded-xl border border-neutral-300 px-4 py-2.5 text-sm outline-none focus:border-[var(--color-brand-green)] focus:ring-2 focus:ring-[var(--color-brand-green)]/20"
                placeholder="Detalhes do produto..."
              />
            </div>

            <div className="sm:col-span-2">
              <label className="flex items-center gap-2 text-sm text-neutral-700">
                <input
                  type="checkbox"
                  checked={ativo}
                  onChange={(e) => setAtivo(e.target.checked)}
                  className="h-4 w-4 rounded border-neutral-300 text-[var(--color-brand-green)] focus:ring-[var(--color-brand-green)]"
                />
                Produto ativo no catálogo
              </label>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={loading || loadingCategories}
              className="inline-flex items-center gap-2 rounded-full bg-[var(--color-brand-green)] px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Cadastrando...
                </>
              ) : (
                "Cadastrar produto"
              )}
            </button>
            <Link
              to="/catalogo"
              className="inline-flex items-center rounded-full border border-neutral-300 px-6 py-3 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-50"
            >
              Ver catálogo
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
