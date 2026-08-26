import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getProduct, listAllCategories, updateProduct, type Category, type CreateProductPayload } from "@/lib/api";

export const Route = createFileRoute("/admin/produtos/$productId")({ component: EditProductPage });

function EditProductPage() {
  const { productId } = Route.useParams();
  const { isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<CreateProductPayload | null>(null);
  const [message, setMessage] = useState("");
  useEffect(()=>{
    if (!isAuthenticated) { navigate({to:"/login"}); return; }
    if (!isAdmin) { navigate({to:"/"}); return; }
    Promise.all([getProduct(Number(productId)), listAllCategories()]).then(([p,c])=>{
      setCategories(c); setForm({...p, preco:Number(p.preco), descricao:p.descricao??"", imagem_url:p.imagem_url??"", temporada:p.temporada??"", versao:p.versao??"", genero:p.genero??"", fornecedor:p.fornecedor??"", sku:p.sku??""});
    }).catch(e=>setMessage(e instanceof Error?e.message:"Falha ao carregar produto"));
  },[productId,isAuthenticated,isAdmin,navigate]);
  async function submit(e: FormEvent) { e.preventDefault(); if(!form)return; await updateProduct(Number(productId),form); setMessage("Produto atualizado com sucesso."); }
  if (!form) return <div className="container-page py-12">{message || "Carregando…"}</div>;
  const set = (key: keyof CreateProductPayload, value: string | number | boolean) => setForm({...form,[key]:value});
  return <div className="section-canvas min-h-screen"><div className="container-page max-w-4xl py-10"><Link to="/admin/cadastrar-produto" className="btn-ghost">← Voltar</Link><div className="surface-card mt-5 p-6 sm:p-8"><p className="eyebrow">Catálogo</p><h1 className="editorial-title text-3xl">Editar produto #{productId}</h1>{message&&<p className="alert-success mt-4">{message}</p>}
    <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={submit}>
      <label className="md:col-span-2">Nome<input className="field-input mt-1" value={form.nome} onChange={e=>set('nome',e.target.value)} required/></label>
      <label>Categoria<select className="field-input mt-1" value={form.category_id} onChange={e=>set('category_id',Number(e.target.value))}>{categories.map(c=><option value={c.id} key={c.id}>{c.nome}</option>)}</select></label>
      <label>Preço<input className="field-input mt-1" type="number" min="0.01" step="0.01" value={form.preco} onChange={e=>set('preco',Number(e.target.value))}/></label>
      {([['tamanho','Tamanho'],['clube','Clube'],['tipo','Tipo'],['temporada','Temporada'],['versao','Versão'],['genero','Gênero'],['fornecedor','Fornecedor'],['sku','SKU']] as [keyof CreateProductPayload,string][]).map(([key,label])=><label key={key}>{label}<input className="field-input mt-1" value={String(form[key]??'')} onChange={e=>set(key,e.target.value)}/></label>)}
      <label>Estoque<input className="field-input mt-1" type="number" min="0" value={form.estoque} onChange={e=>set('estoque',Number(e.target.value))}/></label>
      <label>URL da imagem<input className="field-input mt-1" value={form.imagem_url??''} onChange={e=>set('imagem_url',e.target.value)}/></label>
      <label className="md:col-span-2">Descrição<textarea className="field-input mt-1 min-h-28" value={form.descricao??''} onChange={e=>set('descricao',e.target.value)}/></label>
      <label className="flex items-center gap-2"><input type="checkbox" checked={form.ativo??true} onChange={e=>set('ativo',e.target.checked)}/> Produto ativo</label>
      <div className="md:col-span-2"><button className="btn-primary">Salvar todas as alterações</button></div>
    </form></div></div></div>;
}
