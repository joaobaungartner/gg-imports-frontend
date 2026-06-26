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
