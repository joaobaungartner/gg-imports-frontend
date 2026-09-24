import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Loader2, Shirt, Truck, Ruler, MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { listCategories, listProducts, type Category } from "@/lib/api";
import { groupProductsByVariant, type CatalogProduct } from "@/lib/catalogProducts";
import { formatCurrency } from "@/lib/formatCurrency";
import "@/styles/home.css";

export const Route = createFileRoute("/")({ component: HomePage });

function HomePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [launches, setLaunches] = useState<CatalogProduct[]>([]);
  const [promotions, setPromotions] = useState<CatalogProduct[]>([]);
  const [collectionError, setCollectionError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError("");
      setCollectionError(false);
      try {
        const [all, cats, newItems, offers] = await Promise.allSettled([
          listProducts(true), listCategories(),
          listProducts(true, { collection: "launches" }),
          listProducts(true, { collection: "promotions" }),
        ]);
        if (cancelled) return;
        if (all.status === "rejected" || cats.status === "rejected") throw new Error();
        const names = Object.fromEntries(cats.value.map((c) => [c.id, c.nome]));
        setProducts(groupProductsByVariant(all.value, names));
        setCategories(cats.value);
        setLaunches(newItems.status === "fulfilled" ? groupProductsByVariant(newItems.value, names) : []);
        setPromotions(offers.status === "fulfilled" ? groupProductsByVariant(offers.value, names) : []);
        setCollectionError(newItems.status === "rejected" || offers.status === "rejected");
      } catch {
        if (!cancelled) setError("Não foi possível carregar a vitrine. Tente novamente.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => { cancelled = true; };
  }, [retry]);


  return (
    <div className="storefront home-storefront">
      <section className="container-page home-banner-wrap">
        <div className="home-banner">
          <img className="home-banner-image" src="https://images.unsplash.com/photo-1674760726595-d12f5e45482a?auto=format&fit=crop&w=1600&q=85" alt="Arquibancadas e campo iluminado em uma noite de futebol" fetchPriority="high" />
          <div className="home-banner-copy">
            <p className="eyebrow">Da arquibancada para a rua</p>
            <h1>O JOGO MUDA.<br /><span>A PAIXÃO FICA.</span></h1>
            <p>Encontre o próximo manto da sua coleção.</p>
            <Link to="/catalogo" className="btn-primary">Explorar camisas <ArrowUpRight size={18} /></Link>
          </div>
          <span className="home-banner-signature">GG IMPORTS / FUTEBOL É IDENTIDADE</span>
        </div>
      </section>
      <div className="container-page">
        <div className="home-service-strip" aria-label="Informações para sua compra">
          <div><Truck size={23} /><span><strong>Para todo o Brasil</strong><small>Envio para a sua torcida</small></span></div>
          <Link to="/tabela-medidas"><Ruler size={23} /><span><strong>Seu tamanho certo</strong><small>Consulte a tabela de medidas</small></span></Link>
          <Link to="/contato"><MessageCircle size={23} /><span><strong>Conte com a GG</strong><small>Tire suas dúvidas com a gente</small></span></Link>
        </div>
      </div>

      <section id="vitrine" className="container-page store-section">
        <div className="store-section-heading"><div><p className="eyebrow">Escolha sua próxima camisa</p><h2>NA VITRINE DA GG.</h2></div><Link to="/catalogo" className="text-link">Catálogo completo <ArrowUpRight size={18} /></Link></div>
        {categories.length > 0 && <div className="category-index">{categories.map((category) => <Link key={category.id} to="/catalogo" search={{ categoria: category.nome }}>{category.nome}<ArrowUpRight size={14} /></Link>)}</div>}
        {loading ? <Loading /> : error ? <div className="alert-error flex flex-wrap items-center justify-between gap-4" role="alert">{error}<button className="btn-secondary" onClick={() => setRetry((value) => value + 1)}>Tentar novamente</button></div> : <ProductGrid products={products.slice(0, 4)} />}
      </section>

      <section className="container-page home-collections" aria-label="Explore as coleções">
        <Link to="/lancamentos" className="home-collection home-collection-new">
          <span className="eyebrow">Novidades em campo</span>
          <h2>NOVA CAMISA.<br />MESMA PAIXÃO.</h2>
          <span className="home-collection-link">Conheça os lançamentos <ArrowUpRight size={20} /></span>
          <Shirt className="home-collection-art" size={180} strokeWidth={.6} aria-hidden="true" />
        </Link>
        <Link to="/promocoes" className="home-collection home-collection-offers">
          <span className="eyebrow">Uma boa oportunidade</span>
          <h2>SEU PRÓXIMO<br />MANTO TÁ AQUI.</h2>
          <span className="home-collection-link">Explore as promoções <ArrowUpRight size={20} /></span>
          <span className="home-collection-number" aria-hidden="true">GG</span>
        </Link>
      </section>

      {!loading && !error && <>
        {launches.length > 0 && <section className="container-page store-section"><div className="store-section-heading"><div><p className="eyebrow">Novidades na loja</p><h2>CHEGOU NA GG.</h2></div><Link to="/lancamentos" className="text-link">Todos os lançamentos <ArrowUpRight size={18} /></Link></div><ProductGrid products={launches.slice(0, 4)} /></section>}
        {promotions.length > 0 && <section className="container-page store-section"><div className="store-section-heading"><div><p className="eyebrow">Condições especiais</p><h2>BOA ESCOLHA. BOM PREÇO.</h2></div><Link to="/promocoes" className="text-link">Ver promoções <ArrowUpRight size={18} /></Link></div><ProductGrid products={promotions.slice(0, 4)} /></section>}
        {collectionError && <p role="status" className="container-page py-6 text-sm text-[var(--color-muted)]">Algumas seleções não carregaram. <button className="underline" onClick={() => setRetry((value) => value + 1)}>Tentar novamente</button></p>}
      </>}

      <section className="container-page shop-guide"><div><p className="eyebrow">Pode contar com a GG</p><h2>ANTES DE<br />VESTIR A CAMISA.</h2></div><div className="guide-links"><Link to="/tabela-medidas"><span><small>01 / O caimento</small>Encontre seu tamanho</span><ArrowUpRight /></Link><Link to="/como-comprar"><span><small>02 / A compra</small>Do pedido à sua casa</span><ArrowUpRight /></Link><Link to="/contato"><span><small>03 / A conversa</small>Fale com a gente</span><ArrowUpRight /></Link></div></section>
    </div>
  );
}

function Loading() {
  return <div className="store-loading" role="status"><Loader2 className="animate-spin" size={20} /><span>Carregando camisas…</span></div>;
}

function ProductGrid({ products }: { products: CatalogProduct[] }) {
  if (products.length === 0) return <p className="store-loading">Novas camisas em breve. Acompanhe os lançamentos da loja.</p>;
  return <div className="store-product-grid">{products.map((product) => <Link to="/catalogo" search={{ produto: product.id }} key={product.id} className="store-product"><div className="store-product-image">{product.imagem_url ? <img src={product.imagem_url} alt={product.nome} loading="lazy" /> : <Shirt size={48} strokeWidth={1} />}<span className="stock-label">{product.inStock ? "Pronta entrega" : "Sob encomenda"}</span><span className="product-arrow" aria-hidden="true"><ArrowUpRight size={20} /></span></div><div className="store-product-meta"><p>{product.clube}</p><h3>{product.nome}</h3><div><span>{formatCurrency(product.preco)}</span><span>{product.tamanhos.join(" / ")}</span></div></div></Link>)}</div>;
}
