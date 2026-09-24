import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { CheckCircle2, Loader2, PackagePlus, Plus } from "lucide-react";
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getToken } from "@/lib/auth";
import { ApiError, createProduct, listCategories, type Category } from "@/lib/api";
import { isTokenExpired } from "@/utils/authToken";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/cadastrar-produto")({
  component: CadastrarProdutoPage,
});

const TAMANHOS = ["P", "M", "G", "GG", "XGG"] as const;
const TIPOS = ["Fan", "Player Version", "Retrô", "Infantil", "Treino"] as const;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

type SuccessInfo = {
  nome: string;
  tamanhos: string[];
};

function CadastrarProdutoPage() {
  const navigate = useNavigate();
  const { isAdmin, isAuthenticated } = useAuth();
  const imagemInputRef = useRef<HTMLInputElement>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successInfo, setSuccessInfo] = useState<SuccessInfo | null>(null);

  const [categoryId, setCategoryId] = useState("");
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [preco, setPreco] = useState("");
  const [tamanhos, setTamanhos] = useState<string[]>([]);
  const [clube, setClube] = useState("");
  const [tipo, setTipo] = useState("");
  const [estoque, setEstoque] = useState("");
  const [imagemFile, setImagemFile] = useState<File | null>(null);
  const [imagemPreview, setImagemPreview] = useState<string | null>(null);
  const [ativo, setAtivo] = useState(true);

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
    listCategories()
      .then(setCategories)
      .catch(() => setError("Não foi possível carregar as categorias."))
      .finally(() => setLoadingCategories(false));
  }, []);

  useEffect(() => {
    return () => {
      if (imagemPreview) {
        URL.revokeObjectURL(imagemPreview);
      }
    };
  }, [imagemPreview]);

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setError("");

    if (!file) {
      if (imagemPreview) {
        URL.revokeObjectURL(imagemPreview);
      }
      setImagemFile(null);
      setImagemPreview(null);
      return;
    }

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type as (typeof ACCEPTED_IMAGE_TYPES)[number])) {
      setError("Formato inválido. Use JPG, PNG ou WEBP.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setError("A imagem deve ter no máximo 5MB.");
      event.target.value = "";
      return;
    }

    if (imagemPreview) {
      URL.revokeObjectURL(imagemPreview);
    }

    setImagemFile(file);
    setImagemPreview(URL.createObjectURL(file));
  }

  function clearImage() {
    if (imagemPreview) {
      URL.revokeObjectURL(imagemPreview);
    }
    setImagemFile(null);
    setImagemPreview(null);
    if (imagemInputRef.current) {
      imagemInputRef.current.value = "";
    }
  }

  function resetForm() {
    setNome("");
    setDescricao("");
    setPreco("");
    setClube("");
    setEstoque("");
    clearImage();
    setTamanhos([]);
    setTipo("");
    setCategoryId("");
    setAtivo(true);
  }

  function handleCadastrarOutro() {
    setSuccessInfo(null);
    setError("");
    resetForm();
  }

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
    setSuccessInfo(null);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    const productName = nome.trim();
    const selectedSizes = [...tamanhos];

    setLoading(true);
    try {
      const basePayload = {
        category_id: Number(categoryId),
        nome: productName,
        descricao: descricao.trim() || undefined,
        preco: Number(preco),
        clube: clube.trim(),
        tipo,
        estoque: Number(estoque),
        ativo,
      };

      let uploadedImageUrl: string | undefined;

      for (const tamanho of selectedSizes) {
        const response = await createProduct({
          ...basePayload,
          tamanho,
          imagem: !uploadedImageUrl && imagemFile ? imagemFile : undefined,
          imagem_url: uploadedImageUrl,
        });

        if (response.imagem_url) {
          uploadedImageUrl = response.imagem_url;
        }
      }

      setSuccessInfo({
        nome: productName,
        tamanhos: selectedSizes,
      });
      resetForm();
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Não foi possível cadastrar o produto. Verifique os dados e tente novamente.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  const token = getToken();
  if (!token || isTokenExpired(token)) {
    return null;
  }

  return (
    <div className="section-canvas min-h-[70vh]">
      <div className="container-page py-12 lg:py-16">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8">
            <p className="eyebrow">
              <PackagePlus className="h-3.5 w-3.5" />
              Área administrativa
            </p>
            <h1 className="editorial-title mt-3 text-3xl sm:text-4xl">
              Cadastrar <span className="editorial-serif">produto</span>
            </h1>
            <p className="mt-2 text-sm text-[var(--color-muted)]">
              Adicione novos mantos ao catálogo GG Imports.
            </p>
          </div>

          {successInfo && (
            <div className="alert-success mb-6" role="status">
              <div className="flex items-start gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[4px] bg-[var(--color-forest)] text-white">
                  <CheckCircle2 className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1 space-y-2">
                  <p className="font-display text-lg font-bold text-[var(--color-forest)]">
                    Produto cadastrado com sucesso!
                  </p>
                  <p className="text-sm text-[var(--color-ink)]">
                    O produto <span className="font-semibold">{successInfo.nome}</span> foi
                    adicionado ao catálogo.
                  </p>
                  <p className="text-sm text-[var(--color-muted)]">
                    Tamanhos cadastrados:{" "}
                    <span className="font-medium text-[var(--color-ink)]">
                      {successInfo.tamanhos.join(", ")}
                    </span>
                  </p>
                  <div className="flex flex-wrap gap-3 pt-2">
                    <button type="button" onClick={handleCadastrarOutro} className="btn-secondary">
                      <Plus className="h-4 w-4" />
                      Cadastrar outro produto
                    </button>
                    <Link to="/catalogo" search={{ created: "success" }} className="btn-primary">
                      Ver no catálogo
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="surface-card p-6 sm:p-8">
            {error && (
              <div className="alert-error mb-4" role="alert">
                {error}
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="nome" className="field-label">
                  Nome do produto
                </label>
                <input
                  id="nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="field-input"
                  placeholder="Ex: Flamengo Home 24/25"
                />
              </div>

              <div>
                <label htmlFor="clube" className="field-label">
                  Clube
                </label>
                <input
                  id="clube"
                  value={clube}
                  onChange={(e) => setClube(e.target.value)}
                  className="field-input"
                  placeholder="Ex: Flamengo"
                />
              </div>

              <div>
                <label htmlFor="category" className="field-label">
                  Categoria
                </label>
                <select
                  id="category"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  disabled={loadingCategories}
                  className="field-input"
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
                <label htmlFor="tipo" className="field-label">
                  Tipo
                </label>
                <select
                  id="tipo"
                  value={tipo}
                  onChange={(e) => setTipo(e.target.value)}
                  className="field-input"
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
                <span className="field-label">Tamanhos disponíveis</span>
                <div className="flex flex-wrap gap-2">
                  {TAMANHOS.map((t) => {
                    const selected = tamanhos.includes(t);
                    return (
                      <label
                        key={t}
                        className={cn(
                          "inline-flex cursor-pointer items-center rounded-[4px] border px-4 py-2 text-sm font-medium transition-colors",
                          selected
                            ? "border-[var(--color-forest)] bg-[var(--color-lime)]/25 text-[var(--color-forest)]"
                            : "border-[var(--color-line)] text-[var(--color-ink)] hover:border-[var(--color-forest)]/30",
                        )}
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
                <label htmlFor="preco" className="field-label">
                  Preço (R$)
                </label>
                <input
                  id="preco"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={preco}
                  onChange={(e) => setPreco(e.target.value)}
                  className="field-input"
                  placeholder="249.90"
                />
              </div>

              <div>
                <label htmlFor="estoque" className="field-label">
                  Estoque
                </label>
                <input
                  id="estoque"
                  type="number"
                  min="0"
                  step="1"
                  value={estoque}
                  onChange={(e) => setEstoque(e.target.value)}
                  className="field-input"
                  placeholder="10"
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="imagem" className="field-label">
                  Imagem do produto (opcional)
                </label>
                <input
                  ref={imagemInputRef}
                  id="imagem"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleImageChange}
                  className="field-input file:mr-3 file:rounded-[4px] file:border-0 file:bg-[var(--color-cream)] file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-[var(--color-forest)]"
                />
                <p className="mt-1.5 text-xs text-[var(--color-muted)]">
                  JPG, PNG ou WEBP — máximo 5MB.
                </p>

                {imagemPreview && (
                  <div className="mt-3 flex items-start gap-4">
                    <img
                      src={imagemPreview}
                      alt="Pré-visualização do produto"
                      className="h-32 w-32 rounded-[4px] border border-[var(--color-line)] object-cover"
                    />
                    <button
                      type="button"
                      onClick={clearImage}
                      className="text-sm font-medium text-[var(--color-danger)] hover:opacity-80"
                    >
                      Remover imagem
                    </button>
                  </div>
                )}
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="descricao" className="field-label">
                  Descrição (opcional)
                </label>
                <textarea
                  id="descricao"
                  rows={3}
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  className="field-input"
                  placeholder="Detalhes do produto..."
                />
              </div>

              <div className="sm:col-span-2">
                <label className="flex items-center gap-2 text-sm text-[var(--color-ink)]">
                  <input
                    type="checkbox"
                    checked={ativo}
                    onChange={(e) => setAtivo(e.target.checked)}
                    className="h-4 w-4 rounded-[4px] border-[var(--color-line)] text-[var(--color-forest)] focus:ring-[var(--color-forest-mid)]"
                  />
                  Produto ativo no catálogo
                </label>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={loading || loadingCategories}
                className="btn-primary"
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
              <Link to="/catalogo" className="btn-secondary">
                Ver catálogo
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
