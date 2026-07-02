import { Minus, Plus, Shirt, X } from "lucide-react";
import { useEffect, useState } from "react";
import { formatPrice } from "@/data/products";
import type { CatalogProduct, CatalogProductVariant } from "@/lib/catalogProducts";
import { getProductIds } from "@/lib/catalogProducts";
import { ApiError } from "@/lib/api";
import { cn } from "@/lib/utils";

type ProductDetailsModalProps = {
  product: CatalogProduct | null;
  isOpen: boolean;
  onClose: () => void;
  isAdmin: boolean;
  onAddToCart: (payload: {
    productId: number;
    nome: string;
    imagem_url: string | null;
    preco: number;
    tamanho: string;
    quantidade: number;
  }) => void;
  onDeactivateProduct: (productIds: number[]) => Promise<void>;
  onDeactivateSize: (productId: number) => Promise<void>;
  onDeleteProduct: (productIds: number[]) => Promise<void>;
};

function isVariantAvailable(variant: CatalogProductVariant): boolean {
  return variant.ativo && variant.estoque > 0;
}

export function ProductDetailsModal({
  product,
  isOpen,
  onClose,
  isAdmin,
  onAddToCart,
  onDeactivateProduct,
  onDeactivateSize,
  onDeleteProduct,
}: ProductDetailsModalProps) {
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);
  const [quantidade, setQuantidade] = useState(1);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const selectedVariant =
    product?.variantes.find((variant) => variant.id === selectedVariantId) ?? null;

  useEffect(() => {
    if (!isOpen || !product) return;

    setSelectedVariantId(null);
    setQuantidade(1);
    setFeedback("");
    setError("");
    setLoadingAction(null);
  }, [isOpen, product?.id]);

  useEffect(() => {
    if (!isOpen) return;

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !product) {
    return null;
  }

  async function runAdminAction(actionKey: string, action: () => Promise<void>) {
    setError("");
    setFeedback("");
    setLoadingAction(actionKey);

    try {
      await action();
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Não foi possível concluir a ação administrativa.";
      setError(message);
    } finally {
      setLoadingAction(null);
    }
  }

  function handleAddToCart() {
    setError("");
    setFeedback("");

    if (!selectedVariant) {
      setError("Selecione um tamanho antes de adicionar ao carrinho.");
      return;
    }

    if (!isVariantAvailable(selectedVariant)) {
      setError("O tamanho selecionado está indisponível.");
      return;
    }

    if (quantidade > selectedVariant.estoque) {
      setError(`Estoque disponível: ${selectedVariant.estoque} unidade(s).`);
      return;
    }

    onAddToCart({
      productId: selectedVariant.id,
      nome: product.nome,
      imagem_url: product.imagem_url,
      preco: product.preco,
      tamanho: selectedVariant.tamanho,
      quantidade,
    });

    setFeedback("Produto adicionado ao carrinho!");
  }

  function handleDeactivateProduct() {
    const confirmed = window.confirm(
      "Tem certeza que deseja desativar este produto em todos os tamanhos?",
    );
    if (!confirmed) return;

    runAdminAction("deactivate-product", async () => {
      await onDeactivateProduct(getProductIds(product));
      setFeedback("Produto desativado com sucesso.");
      onClose();
    });
  }

  function handleDeactivateSize() {
    if (!selectedVariant) {
      setError("Selecione um tamanho para desativar.");
      return;
    }

    const confirmed = window.confirm(
      `Tem certeza que deseja desativar o tamanho ${selectedVariant.tamanho}?`,
    );
    if (!confirmed) return;

    runAdminAction("deactivate-size", async () => {
      await onDeactivateSize(selectedVariant.id);
      setFeedback("Tamanho desativado com sucesso.");
    });
  }

  function handleDeleteProduct() {
    const confirmed = window.confirm(
      "Tem certeza que deseja excluir este produto? Essa ação pode não ser reversível.",
    );
    if (!confirmed) return;

    runAdminAction("delete-product", async () => {
      await onDeleteProduct(getProductIds(product));
      setFeedback("Produto excluído com sucesso.");
      onClose();
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Fechar modal"
        className="absolute inset-0 bg-neutral-900/60 backdrop-blur-[2px]"
        onClick={onClose}
      />

      <div className="relative z-10 max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-3xl border border-neutral-200 bg-white shadow-elevated">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-neutral-600 shadow-soft transition-colors hover:bg-neutral-100 hover:text-neutral-900"
          aria-label="Fechar"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="grid gap-0 md:grid-cols-2">
          <div className="relative min-h-[280px] bg-neutral-100 md:min-h-[520px]">
            {product.imagem_url ? (
              <img
                src={product.imagem_url}
                alt={product.nome}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full min-h-[280px] flex-col items-center justify-center gap-3 text-neutral-400 md:min-h-[520px]">
                <Shirt className="h-16 w-16" />
                <span className="text-sm font-medium">Sem imagem</span>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-5 p-6 sm:p-8">
            <div className="space-y-2 pr-10">
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                {product.clube}
              </p>
              <h2 className="font-display text-2xl font-bold text-neutral-900">{product.nome}</h2>
              <p className="text-sm text-neutral-600">
                {product.categoria} · {product.tipo}
              </p>
              <p className="font-display text-2xl font-bold text-[var(--color-brand-green)]">
                {formatPrice(product.preco)}
              </p>
            </div>

            {product.descricao && (
              <p className="text-sm leading-relaxed text-neutral-600">{product.descricao}</p>
            )}

            <div>
              <p className="mb-2 text-sm font-medium text-neutral-700">Tamanhos disponíveis</p>
              <div className="flex flex-wrap gap-2">
                {product.variantes.map((variant) => {
                  const available = isVariantAvailable(variant);
                  const selected = selectedVariantId === variant.id;

                  return (
                    <button
                      key={variant.id}
                      type="button"
                      disabled={!available}
                      onClick={() => {
                        setSelectedVariantId(variant.id);
                        setQuantidade(1);
                        setError("");
                      }}
                      className={cn(
                        "rounded-xl border px-4 py-2 text-sm font-semibold transition-colors",
                        selected
                          ? "border-[var(--color-brand-green)] bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)]"
                          : "border-neutral-300 text-neutral-700 hover:border-neutral-400",
                        !available && "cursor-not-allowed border-neutral-200 bg-neutral-50 text-neutral-400",
                      )}
                    >
                      {variant.tamanho}
                    </button>
                  );
                })}
              </div>
            </div>

            {selectedVariant && (
              <p className="text-sm text-neutral-600">
                Estoque do tamanho {selectedVariant.tamanho}:{" "}
                <span className="font-medium text-neutral-900">{selectedVariant.estoque}</span>
              </p>
            )}

            <div>
              <p className="mb-2 text-sm font-medium text-neutral-700">Quantidade</p>
              <div className="inline-flex items-center rounded-xl border border-neutral-300">
                <button
                  type="button"
                  onClick={() => setQuantidade((value) => Math.max(1, value - 1))}
                  className="flex h-10 w-10 items-center justify-center text-neutral-600 hover:bg-neutral-50"
                  aria-label="Diminuir quantidade"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="min-w-10 text-center text-sm font-semibold text-neutral-900">
                  {quantidade}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setQuantidade((value) =>
                      selectedVariant
                        ? Math.min(selectedVariant.estoque, value + 1)
                        : value + 1,
                    )
                  }
                  disabled={selectedVariant ? quantidade >= selectedVariant.estoque : false}
                  className="flex h-10 w-10 items-center justify-center text-neutral-600 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Aumentar quantidade"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {feedback && (
              <div className="rounded-xl border border-[var(--color-brand-green)]/20 bg-[var(--color-brand-green)]/5 px-4 py-3 text-sm text-[var(--color-brand-green)]">
                {feedback}
              </div>
            )}

            <button
              type="button"
              onClick={handleAddToCart}
              className="inline-flex w-full items-center justify-center rounded-full bg-[var(--color-brand-green)] px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              Adicionar ao carrinho
            </button>

            {isAdmin && (
              <div className="mt-2 rounded-2xl border border-red-200 bg-red-50/60 p-4">
                <p className="mb-3 text-sm font-semibold text-red-800">Ações administrativas</p>
                <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                  <button
                    type="button"
                    disabled={loadingAction !== null}
                    onClick={handleDeactivateProduct}
                    className="rounded-full border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-700 transition-colors hover:bg-red-100 disabled:opacity-60"
                  >
                    Desativar produto
                  </button>
                  <button
                    type="button"
                    disabled={loadingAction !== null}
                    onClick={handleDeactivateSize}
                    className="rounded-full border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-700 transition-colors hover:bg-red-100 disabled:opacity-60"
                  >
                    Desativar tamanho selecionado
                  </button>
                  <button
                    type="button"
                    disabled={loadingAction !== null}
                    onClick={handleDeleteProduct}
                    className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                  >
                    Excluir produto
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
