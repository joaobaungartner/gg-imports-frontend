import { Link } from "@tanstack/react-router";
import { Minus, Plus, ShieldCheck, Shirt, Truck, X } from "lucide-react";
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
    clube?: string;
    categoria?: string;
    tipo?: string;
    imagem_url?: string | null;
    preco: number;
    tamanho: string;
    quantidade: number;
    estoque?: number;
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
  }, [isOpen, product]);

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

  const activeProduct = product;

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

    try {
      onAddToCart({
        productId: selectedVariant.id,
        nome: activeProduct.nome,
        clube: activeProduct.clube,
        categoria: activeProduct.categoria,
        tipo: activeProduct.tipo,
        imagem_url: activeProduct.imagem_url,
        preco: activeProduct.preco,
        tamanho: selectedVariant.tamanho,
        quantidade,
        estoque: selectedVariant.estoque,
      });

      setFeedback("Produto adicionado ao carrinho!");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Não foi possível adicionar ao carrinho.";
      setError(message);
    }
  }

  function handleDeactivateProduct() {
    const confirmed = window.confirm(
      "Tem certeza que deseja desativar este produto em todos os tamanhos?",
    );
    if (!confirmed) return;

    runAdminAction("deactivate-product", async () => {
      await onDeactivateProduct(getProductIds(activeProduct));
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
      await onDeleteProduct(getProductIds(activeProduct));
      setFeedback("Produto excluído com sucesso.");
      onClose();
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Fechar modal"
        className="absolute inset-0 bg-[var(--color-forest)]/75 backdrop-blur-md"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-details-title"
        className="relative z-10 max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-[6px] border border-[var(--color-line)] bg-[var(--color-canvas)] shadow-elevated"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-line)] bg-white text-[var(--color-muted)] transition-colors hover:border-[var(--color-forest)] hover:text-[var(--color-ink)]"
          aria-label="Fechar"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="grid gap-0 md:grid-cols-2">
          <div className="relative min-h-[260px] bg-[var(--color-cream)] md:min-h-[560px]">
            {product.imagem_url ? (
              <img
                src={product.imagem_url}
                alt={product.nome}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full min-h-[260px] flex-col items-center justify-center gap-3 text-[var(--color-muted)] md:min-h-[560px]">
                <Shirt className="h-16 w-16" />
                <span className="text-sm font-medium">Sem imagem</span>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-5 p-6 sm:p-8">
            <div className="space-y-2 pr-10">
              <p className="text-[0.65rem] font-semibold tracking-[0.14em] text-[var(--color-muted)] uppercase">
                {product.categoria}
                {product.clube ? ` · ${product.clube}` : ""}
              </p>
              <h2
                id="product-details-title"
                className="editorial-title text-2xl sm:text-3xl"
              >
                {product.nome}
              </h2>
              <p className="text-xs tracking-wide text-[var(--color-muted)] uppercase">
                {product.tipo}
              </p>
              <p className="font-display text-2xl font-bold text-[var(--color-forest)]">
                {formatPrice(product.preco)}
              </p>
            </div>

            {product.descricao && (
              <div className="border-y border-[var(--color-line)] py-4">
                <p className="text-sm leading-relaxed text-[var(--color-muted)]">
                  {product.descricao}
                </p>
              </div>
            )}

            <div>
              <p className="field-label mb-2">Tamanho</p>
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
                        "flex h-11 min-w-11 items-center justify-center rounded-[4px] border px-3 text-sm font-semibold transition-colors",
                        selected
                          ? "border-[var(--color-forest)] bg-[var(--color-forest)] text-white"
                          : "border-[var(--color-line)] bg-white text-[var(--color-ink)] hover:border-[var(--color-forest-mid)]",
                        !available &&
                          "cursor-not-allowed border-[var(--color-line)] bg-[var(--color-cream)] text-[var(--color-muted)] opacity-55",
                      )}
                    >
                      {variant.tamanho}
                    </button>
                  );
                })}
              </div>
            </div>

            {selectedVariant && (
              <p className="text-sm text-[var(--color-muted)]">
                Estoque do tamanho {selectedVariant.tamanho}:{" "}
                <span className="font-medium text-[var(--color-ink)]">
                  {selectedVariant.estoque}
                </span>
              </p>
            )}

            <div>
              <p className="field-label mb-2">Quantidade</p>
              <div className="inline-flex items-center overflow-hidden rounded-[4px] border border-[var(--color-line)] bg-white">
                <button
                  type="button"
                  onClick={() => setQuantidade((value) => Math.max(1, value - 1))}
                  className="flex h-9 w-9 items-center justify-center text-[var(--color-muted)] transition-colors hover:bg-[var(--color-cream)] hover:text-[var(--color-ink)]"
                  aria-label="Diminuir quantidade"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="min-w-8 text-center text-sm font-semibold text-[var(--color-ink)]">
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
                  className="flex h-9 w-9 items-center justify-center text-[var(--color-muted)] transition-colors hover:bg-[var(--color-cream)] hover:text-[var(--color-ink)] disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Aumentar quantidade"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {error && (
              <div className="alert-error" role="alert">
                {error}
              </div>
            )}

            {feedback && (
              <div className="space-y-3">
                <div className="alert-success" role="status">
                  {feedback}
                </div>
                <Link to="/carrinho" className="btn-secondary w-full">
                  Ver carrinho
                </Link>
              </div>
            )}

            <button type="button" onClick={handleAddToCart} className="btn-primary w-full py-3.5 text-base">
              Adicionar ao carrinho
            </button>

            <ul className="space-y-1.5 text-xs text-[var(--color-muted)]">
              <li className="flex items-center gap-2">
                <Truck className="h-3.5 w-3.5 shrink-0 text-[var(--color-forest-mid)]" />
                Envio para todo o Brasil
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-[var(--color-forest-mid)]" />
                Compra segura e atendimento próximo
              </li>
            </ul>

            {isAdmin && (
              <div className="mt-2 rounded-[4px] border border-[color-mix(in_srgb,var(--color-danger)_35%,white)] bg-[color-mix(in_srgb,var(--color-danger)_6%,white)] p-4">
                <p className="mb-1 text-xs font-semibold tracking-[0.08em] text-[var(--color-danger)] uppercase">
                  Ações administrativas
                </p>
                <p className="mb-3 text-xs text-[var(--color-muted)]">
                  Desative tamanhos ou remova o produto do catálogo. Ações podem ser irreversíveis.
                </p>
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    disabled={loadingAction !== null}
                    onClick={handleDeactivateProduct}
                    className="rounded-[4px] border border-[color-mix(in_srgb,var(--color-danger)_40%,white)] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--color-danger)] transition-colors hover:bg-[color-mix(in_srgb,var(--color-danger)_8%,white)] disabled:opacity-60"
                  >
                    {loadingAction === "deactivate-product"
                      ? "Desativando…"
                      : "Desativar produto"}
                  </button>
                  <button
                    type="button"
                    disabled={loadingAction !== null}
                    onClick={handleDeactivateSize}
                    className="rounded-[4px] border border-[color-mix(in_srgb,var(--color-danger)_40%,white)] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--color-danger)] transition-colors hover:bg-[color-mix(in_srgb,var(--color-danger)_8%,white)] disabled:opacity-60"
                  >
                    {loadingAction === "deactivate-size"
                      ? "Desativando…"
                      : "Desativar tamanho selecionado"}
                  </button>
                  <button
                    type="button"
                    disabled={loadingAction !== null}
                    onClick={handleDeleteProduct}
                    className="rounded-[4px] bg-[var(--color-danger)] px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                  >
                    {loadingAction === "delete-product" ? "Excluindo…" : "Excluir produto"}
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
