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

export function listProducts(active = true) {
  return apiRequest<ProductResponse[]>(`/products/?active=${active}`);
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
  name: string;
  image_url?: string | null;
  size: string;
  quantity: number;
  unit_price: number;
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
  ativo: boolean;
  itens: OrderItemResponse[];
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
