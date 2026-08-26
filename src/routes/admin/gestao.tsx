import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  adjustStock, createCategory, createCoupon, downloadOrdersCsv, getAdminDashboard, getAuditLog,
  getLowStock, getStockMovements, updateAdminClientStatus, updateCategory, updateCoupon,
  type AdminClient, type AuditLog, type Category, type CouponAdmin, type LowStockItem,
  type SalesReport, type StockMovement,
} from "@/lib/api";

export const Route = createFileRoute("/admin/gestao")({ component: AdminManagementPage });

const money = (value: string) => Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function AdminManagementPage() {
  const { isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [report, setReport] = useState<SalesReport | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [coupons, setCoupons] = useState<CouponAdmin[]>([]);
  const [low, setLow] = useState<LowStockItem[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [clients, setClients] = useState<AdminClient[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [error, setError] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [coupon, setCoupon] = useState({ codigo: "", desconto: 10, validade: "" });

  const load = useCallback(async () => {
    try {
      const data = await getAdminDashboard();
      setReport(data.report); setCategories(data.categories); setCoupons(data.coupons);
      setLow(data.low_stock); setMovements(data.movements); setClients(data.clients); setLogs(data.audit);
    } catch (e) { setError(e instanceof Error ? e.message : "Falha ao carregar a gestão."); }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) { navigate({ to: "/login" }); return; }
    if (!isAdmin) { navigate({ to: "/" }); return; }
    void load();
  }, [isAuthenticated, isAdmin, navigate, load]);

  if (!isAuthenticated || !isAdmin) return null;
  return <div className="section-canvas min-h-screen"><div className="container-page py-10 space-y-8">
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div><p className="eyebrow">Administração</p><h1 className="editorial-title text-4xl">Central de gestão</h1></div>
      <div className="flex gap-2"><Link className="btn-secondary" to="/admin/cadastrar-produto">Produtos</Link><Link className="btn-secondary" to="/admin/pedidos">Pedidos</Link><button className="btn-primary" onClick={() => void downloadOrdersCsv()}>Exportar pedidos</button></div>
    </div>
    {error && <p className="rounded-xl bg-red-50 p-4 text-red-700">{error}</p>}
    {report && <section className="grid gap-4 md:grid-cols-3">
      {[['Vendas', money(report.revenue)], ['Pedidos pagos', String(report.order_count)], ['Ticket médio', money(report.average_ticket)]].map(([label,value]) => <div className="surface-card p-6" key={label}><p className="text-sm text-[var(--color-muted)]">{label}</p><p className="editorial-title mt-2 text-3xl">{value}</p></div>)}
    </section>}
    <section className="grid gap-6 xl:grid-cols-2">
      <div className="surface-card p-6"><h2 className="editorial-title text-2xl">Categorias</h2>
        <form className="my-4 flex gap-2" onSubmit={async e => { e.preventDefault(); const created = await createCategory({ nome: categoryName }); setCategories(current => [...current, created].sort((a,b) => a.nome.localeCompare(b.nome, "pt-BR"))); setCategoryName(""); setLogs(await getAuditLog()); }}><input className="input-field flex-1" value={categoryName} onChange={e=>setCategoryName(e.target.value)} placeholder="Nova categoria" required/><button className="btn-primary">Adicionar</button></form>
        <div className="space-y-2">{categories.map(c => <div className="flex items-center justify-between rounded-xl border p-3" key={c.id}><div><b>{c.nome}</b><p className="text-xs text-[var(--color-muted)]">{c.ativo ? 'Ativa' : 'Inativa'}</p></div><button className="btn-ghost" onClick={async()=>{const updated = await updateCategory(c.id,{ativo:!c.ativo}); setCategories(current => current.map(item => item.id === updated.id ? updated : item)); setLogs(await getAuditLog());}}>{c.ativo?'Desativar':'Ativar'}</button></div>)}</div>
      </div>
      <div className="surface-card p-6"><h2 className="editorial-title text-2xl">Cupons</h2>
        <form className="my-4 grid grid-cols-2 gap-2" onSubmit={async e=>{e.preventDefault(); const created = await createCoupon(coupon); setCoupons(current => [...current, created]); setCoupon({codigo:'',desconto:10,validade:''}); setLogs(await getAuditLog());}}><input className="input-field" value={coupon.codigo} onChange={e=>setCoupon({...coupon,codigo:e.target.value.toUpperCase()})} placeholder="Código" required/><input className="input-field" type="number" min="1" max="100" value={coupon.desconto} onChange={e=>setCoupon({...coupon,desconto:Number(e.target.value)})}/><input className="input-field col-span-2" type="date" value={coupon.validade} onChange={e=>setCoupon({...coupon,validade:e.target.value})} required/><button className="btn-primary col-span-2">Criar cupom</button></form>
        <div className="space-y-2">{coupons.map(c=><div className="flex items-center justify-between rounded-xl border p-3" key={c.id}><div><b>{c.codigo}</b><p className="text-xs">{c.desconto}% · {new Date(c.validade+'T00:00:00').toLocaleDateString('pt-BR')}</p></div><button className="btn-ghost" onClick={async()=>{const updated = await updateCoupon(c.id,{ativo:!c.ativo}); setCoupons(current => current.map(item => item.id === updated.id ? updated : item)); setLogs(await getAuditLog());}}>{c.ativo?'Desativar':'Ativar'}</button></div>)}</div>
      </div>
    </section>
    <section className="surface-card p-6"><h2 className="editorial-title text-2xl">Estoque baixo</h2><div className="mt-4 overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr><th>Produto</th><th>Tamanho</th><th>Estoque</th><th>Ajuste</th></tr></thead><tbody>{low.map(p=><tr className="border-t" key={p.id}><td className="py-3">{p.name}<br/><small>{p.sku}</small></td><td>{p.size}</td><td>{p.stock}</td><td><button className="btn-secondary" onClick={async()=>{const raw=prompt('Quantidade a adicionar (use negativo para saída):','1'); const reason=prompt('Motivo do ajuste:','Reposição manual'); if(raw&&reason){await adjustStock(p.id,Number(raw),reason); const [nextLow,nextMovements,nextLogs]=await Promise.all([getLowStock(),getStockMovements(),getAuditLog()]);setLow(nextLow);setMovements(nextMovements);setLogs(nextLogs);}}}>Ajustar</button></td></tr>)}</tbody></table></div></section>
    <section className="grid gap-6 xl:grid-cols-2">
      <div className="surface-card p-6"><h2 className="editorial-title text-2xl">Clientes</h2><div className="mt-4 max-h-96 space-y-2 overflow-auto">{clients.map(c=><div className="flex justify-between gap-3 rounded-xl border p-3" key={c.id}><div><b>{c.name}</b><p className="text-xs">{c.email} · {c.order_count} pedidos · {money(c.total_spent)}</p></div><button className="btn-ghost" onClick={async()=>{await updateAdminClientStatus(c.id,!c.active);setClients(current=>current.map(item=>item.id===c.id?{...item,active:!c.active}:item));setLogs(await getAuditLog());}}>{c.active?'Bloquear':'Ativar'}</button></div>)}</div></div>
      <div className="surface-card p-6"><h2 className="editorial-title text-2xl">Mais vendidos</h2><ol className="mt-4 space-y-3">{report?.top_products.map((p,i)=><li className="flex justify-between border-b pb-2" key={p.product_id}><span>{i+1}. {p.name}</span><b>{p.quantity} un.</b></li>)}</ol></div>
    </section>
    <section className="grid gap-6 xl:grid-cols-2"><div className="surface-card p-6"><h2 className="editorial-title text-2xl">Movimentações recentes</h2><div className="mt-4 max-h-80 overflow-auto text-sm">{movements.map(m=><p className="border-b py-2" key={m.id}><b>{m.product_name}</b> · {m.quantity>0?'+':''}{m.quantity} ({m.previous_stock} → {m.new_stock})<br/><small>{m.reason} · {new Date(m.created_at).toLocaleString('pt-BR')}</small></p>)}</div></div>
      <div className="surface-card p-6"><h2 className="editorial-title text-2xl">Auditoria administrativa</h2><div className="mt-4 max-h-80 overflow-auto text-sm">{logs.map(l=><p className="border-b py-2" key={l.id}><b>{l.admin_name}</b> · {l.action} em {l.resource_type} {l.resource_id ?? ''}<br/><small>{new Date(l.created_at).toLocaleString('pt-BR')}</small></p>)}</div></div></section>
  </div></div>;
}
