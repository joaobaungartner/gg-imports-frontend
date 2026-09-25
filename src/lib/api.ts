import { config } from "@/config/config";
import { getToken } from "@/lib/auth";
import { handleUnauthorized } from "@/lib/authSession";

type ApiErrorBody = {
  detail?: string | { msg: string }[];
};

const GET_CACHE_TTL_MS = 60_000;
const getCache = new Map<string, { expiresAt: number; value: unknown }>();
const inFlightGets = new Map<string, Promise<unknown>>();
let cacheGeneration = 0;

function isCacheablePath(path: string): boolean {
  // Only public catalog/content reads may be reused. Account and transaction
  // state (including future endpoints) is fresh by default.
  return /^\/(products|categories|site-content)(\/|\?|$)/.test(path);
}

export function invalidateApiCache(pathPrefix?: string) {
  cacheGeneration += 1;
  for (const key of getCache.keys()) {
    const path = key.slice(key.indexOf(":") + 1);
    if (!pathPrefix || path.startsWith(pathPrefix)) getCache.delete(key);
  }
  for (const key of inFlightGets.keys()) {
    const path = key.slice(key.indexOf(":") + 1);
    if (!pathPrefix || path.startsWith(pathPrefix)) inFlightGets.delete(key);
  }
}

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

function isLoginPath(path: string): boolean {
  return path === "/auth/login" || path.startsWith("/auth/login?");
}

async function parseError(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as ApiErrorBody;
    if (typeof body.detail === "string") return body.detail;
    if (Array.isArray(body.detail) && body.detail.length > 0) {
      return body.detail.map((item) => item.msg).join(". ");
    }
  } catch {
    // ignore parse errors
  }
  return "Ocorreu um erro. Tente novamente.";
}

async function handleApiResponse(response: Response, path: string): Promise<Response> {
  if (response.status === 401 && !isLoginPath(path)) {
    handleUnauthorized();
    throw new ApiError("Sua sessão expirou. Faça login novamente.", 401);
  }

  if (!response.ok) {
    throw new ApiError(await parseError(response), response.status);
  }

  return response;
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const method = (options.method ?? "GET").toUpperCase();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> | undefined),
  };

  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const cacheKey = `${token ?? "public"}:${path}`;
  // Requests with their own cancellation lifecycle must not share an in-flight GET.
  const cacheable = method === "GET" && isCacheablePath(path) && !options.signal
    && (!options.cache || options.cache === "default");
  if (cacheable) {
    const cached = getCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) return cached.value as T;
    if (cached) getCache.delete(cacheKey);
    const existing = inFlightGets.get(cacheKey);
    if (existing) return existing as Promise<T>;
  }

  const generation = cacheGeneration;
  const request = (async () => {
    const response = await fetch(`${config.apiBaseUrl}${path}`, {
      ...options, headers, cache: method === "GET" ? "no-store" : options.cache,
    });

    await handleApiResponse(response, path);

    // A mutation may affect several resources (e.g. addresses and /auth/me).
    // Invalidate before returning, including successful 204 responses.
    if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) invalidateApiCache();

    if (response.status === 204) return undefined as T;
    const data = await response.json() as T;
    if (cacheable && generation === cacheGeneration) {
      getCache.set(cacheKey, { value: data, expiresAt: Date.now() + GET_CACHE_TTL_MS });
    }
    return data;
  })();

  if (cacheable) inFlightGets.set(cacheKey, request);
  try { return await request; }
  finally {
    // A superseded request must not remove a newer request's deduplication entry.
    if (cacheable && inFlightGets.get(cacheKey) === request) inFlightGets.delete(cacheKey);
  }
}

export type LoginPayload = {
  email: string;
  senha: string;
};

export type LoginResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: {
    id: number;
    nome: string;
    email: string;
    role: string;
  };
};

export type RegisterPayload = {
  nome: string;
  email: string;
  senha: string;
  telefone: string;
  cpf: string;
};

export function login(payload: LoginPayload) {
  return apiRequest<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function registerClient(payload: RegisterPayload) {
  return apiRequest("/clients/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export type Category = {
  id: number;
  nome: string;
  descricao: string | null;
  ativo: boolean;
};

export type CreateProductPayload = {
  category_id: number;
  nome: string;
  descricao?: string;
  preco: number;
  tamanho: string;
  clube: string;
  tipo: string;
  temporada?: string;
  versao?: string;
  genero?: string;
  fornecedor?: string;
  sku?: string;
  estoque: number;
  imagem_url?: string;
  imagem?: File;
  ativo?: boolean;
};

export type ProductResponse = {
  id: number;
  category_id: number;
  nome: string;
  descricao: string | null;
  preco: string;
  tamanho: string;
  clube: string;
  tipo: string;
  temporada?: string | null;
  versao?: string | null;
  genero?: string | null;
  fornecedor?: string | null;
  sku?: string | null;
  estoque: number;
  imagem_url: string | null;
  ativo: boolean;
};

export function listCategories() {
  return apiRequest<Category[]>("/categories/?active=true");
}

export function listAllCategories() {
  return apiRequest<Category[]>("/categories/");
}

export function createCategory(payload: { nome: string; descricao?: string }) {
  return apiRequest<Category>("/categories/", { method: "POST", body: JSON.stringify(payload) }).then((result) => { invalidateApiCache("/categories/"); invalidateApiCache("/admin/management/audit"); invalidateApiCache("/admin/management/dashboard"); return result; });
}

export function updateCategory(id: number, payload: Partial<Category>) {
  return apiRequest<Category>(`/categories/${id}`, { method: "PUT", body: JSON.stringify(payload) }).then((result) => { invalidateApiCache("/categories/"); invalidateApiCache("/admin/management/audit"); invalidateApiCache("/admin/management/dashboard"); return result; });
}

export function listProducts(
  active: boolean | null = true,
  options?: { collection?: "promotions" | "launches" },
) {
  const params = new URLSearchParams();
  if (active !== null) params.set("active", String(active));
  if (options?.collection) {
    params.set("collection", options.collection);
  }
  return apiRequest<ProductResponse[]>(`/products/?${params.toString()}`);
}

export function getProduct(productId: number) {
  return apiRequest<ProductResponse>(`/products/${productId}`);
}

export function updateProduct(productId: number, payload: Partial<CreateProductPayload>) {
  return apiRequest<ProductResponse>(`/products/${productId}`, { method: "PUT", body: JSON.stringify(payload) });
}

export type CouponAdmin = { id: number; codigo: string; desconto: string; validade: string; ativo: boolean };
export function listCoupons() { return apiRequest<CouponAdmin[]>("/coupons/"); }
export function createCoupon(payload: { codigo: string; desconto: number; validade: string; ativo?: boolean }) {
  return apiRequest<CouponAdmin>("/coupons/", { method: "POST", body: JSON.stringify(payload) }).then((result) => { invalidateApiCache("/coupons/"); invalidateApiCache("/admin/management/audit"); invalidateApiCache("/admin/management/dashboard"); return result; });
}
export function updateCoupon(id: number, payload: Partial<{ codigo: string; desconto: number; validade: string; ativo: boolean }>) {
  return apiRequest<CouponAdmin>(`/coupons/${id}`, { method: "PUT", body: JSON.stringify(payload) }).then((result) => { invalidateApiCache("/coupons/"); invalidateApiCache("/admin/management/audit"); invalidateApiCache("/admin/management/dashboard"); return result; });
}

export type SalesReport = { revenue: string; order_count: number; average_ticket: string; top_products: { product_id: number; name: string; quantity: number; revenue: string }[] };
export type LowStockItem = { id: number; name: string; sku: string | null; size: string; stock: number; image_url: string | null };
export type StockMovement = { id: number; product_id: number; product_name: string; type: string; quantity: number; previous_stock: number; new_stock: number; reason: string | null; created_at: string };
export type AdminClient = { id: number; user_id: number; name: string; email: string; phone: string | null; cpf: string; active: boolean; email_verified: boolean; order_count: number; total_spent: string };
export type AuditLog = { id: number; admin_name: string; action: string; resource_type: string; resource_id: string | null; details: Record<string, unknown> | null; created_at: string };
export type AdminDashboard = { report: SalesReport; categories: Category[]; coupons: CouponAdmin[]; low_stock: LowStockItem[]; movements: StockMovement[]; clients: AdminClient[]; audit: AuditLog[] };

export function getSalesReport() { return apiRequest<SalesReport>("/admin/management/reports/sales"); }
export function getLowStock(threshold = 5) { return apiRequest<LowStockItem[]>(`/admin/management/stock/low?threshold=${threshold}`); }
export function getStockMovements() { return apiRequest<StockMovement[]>("/admin/management/stock/movements"); }
export function adjustStock(productId: number, quantity_delta: number, reason: string) {
  return apiRequest(`/admin/management/stock/${productId}/adjust`, { method: "POST", body: JSON.stringify({ quantity_delta, reason }) }).then((result) => { invalidateApiCache("/admin/management/stock/"); invalidateApiCache("/admin/management/audit"); invalidateApiCache("/admin/management/dashboard"); return result; });
}
export function listAdminClients() { return apiRequest<AdminClient[]>("/admin/management/clients"); }
export function updateAdminClientStatus(clientId: number, active: boolean) {
  return apiRequest(`/admin/management/clients/${clientId}/status`, { method: "PATCH", body: JSON.stringify({ active }) }).then((result) => { invalidateApiCache("/admin/management/clients"); invalidateApiCache("/admin/management/audit"); invalidateApiCache("/admin/management/dashboard"); return result; });
}
export function getAuditLog() { return apiRequest<AuditLog[]>("/admin/management/audit"); }
export function getAdminDashboard() { return apiRequest<AdminDashboard>("/admin/management/dashboard"); }
export async function downloadOrdersCsv() {
  const path = "/admin/management/orders/export.csv";
  const response = await fetch(`${config.apiBaseUrl}${path}`, { headers: { Authorization: `Bearer ${getToken() ?? ""}` } });
  await handleApiResponse(response, path);
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url; anchor.download = "pedidos.csv"; anchor.click();
  URL.revokeObjectURL(url);
}

export type ProductCollectionItem = {
  group_key: string;
  selected: boolean;
  nome: string;
  clube: string;
  categoria: string;
  tipo: string;
  preco: string;
  estoque_total: number;
  imagem_url: string | null;
  ativo: boolean;
  variant_ids: number[];
};

export type ProductCollectionResponse = {
  slug: string;
  name: string;
  selected_count: number;
  items: ProductCollectionItem[];
};

export function getAdminProductCollection(slug: "promotions" | "launches") {
  return apiRequest<ProductCollectionResponse>(`/admin/product-collections/${slug}`);
}

export function updateAdminProductCollection(
  slug: "promotions" | "launches",
  group_keys: string[],
) {
  return apiRequest<ProductCollectionResponse>(`/admin/product-collections/${slug}`, {
    method: "PUT",
    body: JSON.stringify({ group_keys }),
  });
}

export type HowToBuyStep = {
  title: string;
  description: string;
};

export type HowToBuyContent = {
  title: string;
  subtitle: string;
  eyebrow: string;
  steps: HowToBuyStep[];
};

export function getHowToBuyContent() {
  return apiRequest<HowToBuyContent>("/site-content/how-to-buy");
}

export function updateHowToBuyContent(payload: HowToBuyContent) {
  return apiRequest<HowToBuyContent>("/admin/site-content/how-to-buy", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deactivateProduct(productId: number) {
  return apiRequest<ProductResponse>(`/products/${productId}/deactivate`, {
    method: "PATCH",
  });
}

export function activateProduct(productId: number) {
  return apiRequest<ProductResponse>(`/products/${productId}/activate`, {
    method: "PATCH",
  });
}

export function deactivateManyProducts(productIds: number[]) {
  return apiRequest<{ message: string; product_ids: number[] }>("/products/deactivate-many", {
    method: "PATCH",
    body: JSON.stringify({ product_ids: productIds }),
  });
}

export function deleteManyProducts(productIds: number[]) {
  return apiRequest<{ message: string; product_ids: number[] }>("/products/delete-many", {
    method: "DELETE",
    body: JSON.stringify({ product_ids: productIds }),
  });
}

export function createProduct(payload: CreateProductPayload) {
  const formData = new FormData();
  formData.append("category_id", String(payload.category_id));
  formData.append("nome", payload.nome);
  formData.append("preco", String(payload.preco));
  formData.append("tamanho", payload.tamanho);
  formData.append("clube", payload.clube);
  formData.append("tipo", payload.tipo);
  if (payload.temporada) formData.append("temporada", payload.temporada);
  if (payload.versao) formData.append("versao", payload.versao);
  if (payload.genero) formData.append("genero", payload.genero);
  if (payload.fornecedor) formData.append("fornecedor", payload.fornecedor);
  if (payload.sku) formData.append("sku", payload.sku);
  formData.append("estoque", String(payload.estoque));
  formData.append("ativo", String(payload.ativo ?? true));

  if (payload.descricao) {
    formData.append("descricao", payload.descricao);
  }

  if (payload.imagem) {
    formData.append("imagem", payload.imagem);
  } else if (payload.imagem_url) {
    formData.append("imagem_url", payload.imagem_url);
  }

  return apiRequest<ProductResponse>("/products/", {
    method: "POST",
    body: formData,
  });
}

export type ClientProfile = {
  id: number;
  user_id: number;
  nome: string;
  email: string;
  telefone: string;
  cpf: string;
  role: string;
  ativo: boolean;
  data_cadastro: string;
};

export type AuthMeAddress = {
  id: number;
  rua: string;
  numero: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  ativo: boolean;
};

export type AuthMeResponse = {
  id: number;
  nome: string;
  email: string;
  telefone: string | null;
  role: string;
  ativo: boolean;
  data_cadastro: string;
  client_id: number | null;
  cpf: string | null;
  endereco: AuthMeAddress | null;
  email_verificado?: boolean;
};

export function getAuthMe() {
  return apiRequest<AuthMeResponse>("/auth/me");
}

export type ServerCart = {
  id: number;
  client_id: number;
  itens: Array<{ id: number; product_id: number; quantidade: number; preco_unitario: string }>;
  valor_total: string;
};

export function getMyCart(signal?: AbortSignal) {
  return apiRequest<ServerCart>("/carts/me/current", { signal });
}

export function syncMyCart(items: Array<{ product_id: number; quantidade: number }>, signal?: AbortSignal) {
  return apiRequest<ServerCart>("/carts/me/current", {
    method: "PUT",
    body: JSON.stringify({ items }),
    signal,
  });
}

export function requestPasswordReset(email: string) {
  return apiRequest<{ message: string }>("/auth/password/forgot", { method: "POST", body: JSON.stringify({ email }) });
}

export function resetPassword(token: string, nova_senha: string) {
  return apiRequest<{ message: string }>("/auth/password/reset", { method: "POST", body: JSON.stringify({ token, nova_senha }) });
}

export function changePassword(senha_atual: string, nova_senha: string) {
  return apiRequest<{ message: string }>("/auth/password/change", { method: "POST", body: JSON.stringify({ senha_atual, nova_senha }) });
}

export function requestEmailVerification() {
  return apiRequest<{ message: string }>("/auth/email/request-verification", { method: "POST" });
}

export function verifyEmail(token: string) {
  return apiRequest<{ message: string }>("/auth/email/verify", { method: "POST", body: JSON.stringify({ token }) });
}

export function getClientByUserId(userId: number) {
  return apiRequest<ClientProfile>(`/clients/user/${userId}`);
}

export function updateUser(userId: number, payload: { nome?: string; telefone?: string }) {
  return apiRequest(`/users/${userId}`, { method: "PUT", body: JSON.stringify(payload) });
}

export function createAddress(payload: { client_id: number; rua: string; numero: string; bairro: string; cidade: string; estado: string; cep: string }) {
  return apiRequest("/addresses/", { method: "POST", body: JSON.stringify(payload) });
}

export type ShippingQuotePayload = {
  cep: string;
  shipping_method: string;
  item_count: number;
};

export type ShippingQuoteResponse = {
  shipping_method: string;
  frete: string;
  label: string;
};

export function quoteShipping(payload: ShippingQuotePayload) {
  return apiRequest<ShippingQuoteResponse>("/shipping/quote", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export type ShippingAddressPayload = {
  cep: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
};

export type CreateOrderItemPayload = {
  product_id: number;
  quantity: number;
};

export type CreateOrderPayload = {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_cpf?: string;
  shipping_address: ShippingAddressPayload;
  shipping_method: string;
  payment_method: string;
  frete: number;
  coupon_code?: string;
  items: CreateOrderItemPayload[];
};

export type CouponResponse = {
  id: number;
  codigo: string;
  desconto: string;
  validade: string;
  ativo: boolean;
};

export function validateCoupon(codigo: string) {
  return apiRequest<CouponResponse>("/coupons/validate", {
    method: "POST",
    body: JSON.stringify({ codigo }),
  });
}

export type OrderItemResponse = {
  id: number;
  product_id: number;
  nome_produto: string | null;
  imagem_url: string | null;
  tamanho: string | null;
  quantidade: number;
  preco_unitario: string;
  subtotal: string;
  ativo: boolean;
};

export type OrderTimelineItem = {
  status: string;
  label: string;
  message: string;
  created_at: string;
};

export type OrderResponse = {
  id: number;
  client_id: number | null;
  endereco_id: number | null;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  customer_cpf: string | null;
  shipping_cep: string | null;
  shipping_street: string | null;
  shipping_number: string | null;
  shipping_complement: string | null;
  shipping_neighborhood: string | null;
  shipping_city: string | null;
  shipping_state: string | null;
  shipping_method: string | null;
  payment_method: string | null;
  subtotal: string;
  frete: string;
  valor_total: string;
  status: string;
  data_pedido: string;
  updated_at?: string | null;
  ativo: boolean;
  itens: OrderItemResponse[];
  timeline?: OrderTimelineItem[];
  codigo_rastreio?: string | null;
  url_rastreio?: string | null;
};

export function cancelOrder(orderId: number) {
  return apiRequest<OrderResponse>(`/orders/${orderId}/cancel`, { method: "PATCH" });
}

export function createPostSaleRequest(payload: { order_id: number; request_type: "RETURN" | "EXCHANGE" | "REFUND"; reason: string }) {
  return apiRequest("/post-sales/", { method: "POST", body: JSON.stringify(payload) });
}

export function updateOrderTracking(orderId: number, codigo_rastreio: string, url_rastreio?: string) {
  return apiRequest<AdminOrderDetail>(`/admin/orders/${orderId}/tracking`, { method: "PATCH", body: JSON.stringify({ codigo_rastreio, url_rastreio }) });
}

export function createOrder(payload: CreateOrderPayload) {
  return apiRequest<OrderResponse>("/orders/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export type PaymentResponse = {
  id: number;
  order_id: number;
  metodo: string;
  status: string;
  valor: string;
  codigo_transacao: string | null;
  data_pagamento: string | null;
  ativo: boolean;
  gateway: string | null;
  gateway_status: string | null;
  status_detail: string | null;
  payment_method_id: string | null;
  installments: number | null;
  pix_qr_code: string | null;
  pix_qr_code_base64: string | null;
  pix_ticket_url: string | null;
  expires_at: string | null;
  refunded_amount: string;
};

export type CardPaymentData = {
  token: string;
  payment_method_id: string;
  issuer_id?: string;
  installments: number;
  payer_email?: string;
  identification_type?: string;
  identification_number?: string;
};

export function createPayment(orderId: number, method: "PIX" | "CREDIT_CARD") {
  return apiRequest<PaymentResponse>("/payments/", {
    method: "POST",
    body: JSON.stringify({ order_id: orderId, metodo: method }),
  });
}

export function processPayment(paymentId: number, data?: CardPaymentData) {
  return apiRequest<PaymentResponse>(`/payments/${paymentId}/process`, {
    method: "POST",
    body: JSON.stringify(data ?? {}),
  });
}

export function getPaymentByOrder(orderId: number) {
  return apiRequest<PaymentResponse>(`/payments/order/${orderId}`);
}

export function getOrderById(orderId: number) {
  return apiRequest<OrderResponse>(`/orders/${orderId}`);
}

export type OrderListItem = {
  id: number;
  client_id: number | null;
  customer_name: string | null;
  data_pedido: string;
  subtotal: string;
  frete: string;
  valor_total: string;
  status: string;
  ativo: boolean;
  item_count: number;
  payment_method: string | null;
  shipping_method: string | null;
};

export function getMyOrders() {
  return apiRequest<OrderListItem[]>("/orders/me");
}

export type TrackOrderPayload = {
  order_id: number;
  identifier: string;
};

export function trackOrder(payload: TrackOrderPayload) {
  return apiRequest<OrderResponse>("/orders/track", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export type AdminOrderSummary = {
  total: number;
  pending_payment: number;
  preparing: number;
  shipped_or_ready: number;
  delivered: number;
  canceled: number;
};

export type AdminOrderListItem = {
  id: number;
  data_pedido: string;
  updated_at: string | null;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  item_count: number;
  valor_total: string;
  shipping_method: string | null;
  payment_method: string | null;
  payment_status: string | null;
  status: string;
};

export type AdminOrderListResponse = {
  items: AdminOrderListItem[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
};

export type AdminOrderFilters = {
  page?: number;
  page_size?: number;
  status?: string;
  shipping_method?: string;
  payment_status?: string;
  payment_method?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
  sort?: "asc" | "desc";
};

export type OrderStatusHistoryItem = {
  id: number;
  order_id: number;
  previous_status: string | null;
  new_status: string;
  changed_by_user_id: number | null;
  changed_by_name: string | null;
  note: string | null;
  created_at: string;
};

export type AdminOrderDetail = {
  id: number;
  client_id: number | null;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  customer_cpf: string | null;
  shipping_cep: string | null;
  shipping_street: string | null;
  shipping_number: string | null;
  shipping_complement: string | null;
  shipping_neighborhood: string | null;
  shipping_city: string | null;
  shipping_state: string | null;
  shipping_method: string | null;
  payment_method: string | null;
  payment_status: string | null;
  pagamento_id: number | null;
  cupom_id: number | null;
  subtotal: string;
  frete: string;
  desconto_cupom: string;
  valor_total: string;
  data_pedido: string;
  updated_at: string | null;
  status: string;
  ativo: boolean;
  admin_notes: string | null;
  codigo_rastreio: string | null;
  url_rastreio: string | null;
  allowed_transitions: string[];
  itens: OrderItemResponse[];
  status_history: OrderStatusHistoryItem[];
};

function toQuery(params: Record<string, string | number | undefined | null>) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    search.set(key, String(value));
  });
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export function getAdminOrdersSummary(filters?: { date_from?: string; date_to?: string }) {
  return apiRequest<AdminOrderSummary>(
    `/admin/orders/summary${toQuery({
      date_from: filters?.date_from,
      date_to: filters?.date_to,
    })}`,
  );
}

export function listAdminOrders(filters: AdminOrderFilters = {}) {
  return apiRequest<AdminOrderListResponse>(
    `/admin/orders/${toQuery({
      page: filters.page,
      page_size: filters.page_size,
      status: filters.status,
      shipping_method: filters.shipping_method,
      payment_status: filters.payment_status,
      payment_method: filters.payment_method,
      date_from: filters.date_from,
      date_to: filters.date_to,
      search: filters.search,
      sort: filters.sort,
    })}`,
  );
}

export function getAdminOrderById(orderId: number) {
  return apiRequest<AdminOrderDetail>(`/admin/orders/${orderId}`);
}

export function updateAdminOrderStatus(
  orderId: number,
  payload: { status: string; note?: string; force?: boolean },
) {
  return apiRequest<AdminOrderDetail>(`/admin/orders/${orderId}/status`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function updateAdminOrderNotes(orderId: number, admin_notes: string | null) {
  return apiRequest<AdminOrderDetail>(`/admin/orders/${orderId}/notes`, {
    method: "PATCH",
    body: JSON.stringify({ admin_notes }),
  });
}

export function getAdminOrderHistory(orderId: number) {
  return apiRequest<OrderStatusHistoryItem[]>(`/admin/orders/${orderId}/history`);
}
