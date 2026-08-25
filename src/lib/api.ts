import { config } from "@/config/config";
import { getToken } from "@/lib/auth";
import { handleUnauthorized } from "@/lib/authSession";

type ApiErrorBody = {
  detail?: string | { msg: string }[];
};

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

  const response = await fetch(`${config.apiBaseUrl}${path}`, {
    ...options,
    headers,
  });

  await handleApiResponse(response, path);

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
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
  estoque: number;
  imagem_url: string | null;
  ativo: boolean;
};

export function listCategories() {
  return apiRequest<Category[]>("/categories/?active=true");
}

export function listProducts(
  active = true,
  options?: { collection?: "promotions" | "launches" },
) {
  const params = new URLSearchParams();
  params.set("active", String(active));
  if (options?.collection) {
    params.set("collection", options.collection);
  }
  return apiRequest<ProductResponse[]>(`/products/?${params.toString()}`);
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
};

export function getAuthMe() {
  return apiRequest<AuthMeResponse>("/auth/me");
}

export function getClientByUserId(userId: number) {
  return apiRequest<ClientProfile>(`/clients/user/${userId}`);
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
  items: CreateOrderItemPayload[];
};

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
};

export function createOrder(payload: CreateOrderPayload) {
  return apiRequest<OrderResponse>("/orders/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
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
