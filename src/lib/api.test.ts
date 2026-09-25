import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiRequest, invalidateApiCache, listProducts } from "./api";

describe("deduplicação de GETs", () => {
  beforeEach(() => {
    invalidateApiCache();
    vi.stubGlobal("localStorage", {
      getItem: vi.fn(() => null), setItem: vi.fn(), removeItem: vi.fn(), clear: vi.fn(),
    });
  });

  it("compartilha uma requisição em andamento entre consumidores", async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify([{ id: 1 }]), {
      status: 200, headers: { "Content-Type": "application/json" },
    }));
    vi.stubGlobal("fetch", fetchMock);

    const [first, second] = await Promise.all([
      apiRequest<Array<{ id: number }>>("/products/?active=true"),
      apiRequest<Array<{ id: number }>>("/products/?active=true"),
    ]);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(first).toEqual(second);
  });

  it("reutiliza o resultado recente e permite invalidação explícita", async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ ok: true }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    await apiRequest("/categories/?active=true");
    await apiRequest("/categories/?active=true");
    expect(fetchMock).toHaveBeenCalledTimes(1);
    invalidateApiCache("/categories/");
    await apiRequest("/categories/?active=true");
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("não compartilha consultas com ciclos de cancelamento independentes", async () => {
    const fetchMock = vi.fn(async () => new Response("{}", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    const first = new AbortController();
    const second = new AbortController();
    await Promise.all([
      apiRequest("/carts/me/current", { signal: first.signal }),
      apiRequest("/carts/me/current", { signal: second.signal }),
    ]);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});


describe("filtro de status do catálogo", () => {
  beforeEach(() => {
    invalidateApiCache();
    vi.stubGlobal("localStorage", { getItem: vi.fn(() => null) });
  });

  it("mantém a consulta pública apenas com ativos e permite todos na consulta administrativa", async () => {
    const fetchMock = vi.fn(async () => new Response("[]", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    await listProducts();
    await listProducts(null);
    await listProducts(false);
    const urls = fetchMock.mock.calls.map((call) => String((call as unknown[])[0]));
    expect(urls[0]).toContain("active=true");
    expect(urls[1]).not.toContain("active=");
    expect(urls[2]).toContain("active=false");
  });
});
