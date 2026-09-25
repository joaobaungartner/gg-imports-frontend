import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiRequest, invalidateApiCache, listProducts, getAuthMe, updateUser, createAddress } from "./api";

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

describe("atualização de dados e invalidação", () => {
  beforeEach(() => {
    invalidateApiCache();
    vi.stubGlobal("localStorage", { getItem: vi.fn(() => null) });
  });

  it.each(["/orders/1", "/orders/me", "/payments/order/1", "/admin/orders/1", "/auth/me", "/addresses/", "/clients/user/1", "/carts/me/current"])(
    "busca %s novamente sem aguardar o TTL", async (path) => {
      const fetchMock = vi.fn()
        .mockResolvedValueOnce(new Response('{"status":"PENDING"}'))
        .mockResolvedValueOnce(new Response('{"status":"UPDATED"}'));
      vi.stubGlobal("fetch", fetchMock);
      await apiRequest(path);
      expect(await apiRequest(path)).toEqual({ status: "UPDATED" });
      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(fetchMock.mock.calls[1][1].cache).toBe("no-store");
    },
  );

  it.each(["POST", "PUT", "PATCH", "DELETE"])("invalida consultas após %s com resposta 204", async (method) => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response('[{"id":1}]'))
      .mockResolvedValueOnce(new Response(null, { status: 204 }))
      .mockResolvedValueOnce(new Response('[{"id":2}]'));
    vi.stubGlobal("fetch", fetchMock);
    await listProducts();
    await apiRequest("/products/1", { method });
    expect(await listProducts()).toEqual([{ id: 2 }]);
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("reconsulta o perfil após salvar dados pessoais e endereço", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response('{"nome":"Antes"}'))
      .mockResolvedValueOnce(new Response('{}'))
      .mockResolvedValueOnce(new Response('{"nome":"Depois"}'))
      .mockResolvedValueOnce(new Response('{}'))
      .mockResolvedValueOnce(new Response('{"nome":"Depois","endereco":{"rua":"Nova"}}'));
    vi.stubGlobal("fetch", fetchMock);
    await getAuthMe();
    await updateUser(1, { nome: "Depois" });
    expect((await getAuthMe()).nome).toBe("Depois");
    await createAddress({ client_id: 1, rua: "Nova", numero: "1", bairro: "Centro", cidade: "SP", estado: "SP", cep: "01001000" });
    expect((await getAuthMe()).endereco?.rua).toBe("Nova");
    expect(fetchMock).toHaveBeenCalledTimes(5);
  });

  it("uma resposta anterior à alteração não repopula o cache nem remove a consulta nova", async () => {
    let resolveOld!: (response: Response) => void;
    let resolveNew!: (response: Response) => void;
    const fetchMock = vi.fn()
      .mockReturnValueOnce(new Promise<Response>(resolve => { resolveOld = resolve; }))
      .mockResolvedValueOnce(new Response('{}'))
      .mockReturnValueOnce(new Promise<Response>(resolve => { resolveNew = resolve; }));
    vi.stubGlobal("fetch", fetchMock);
    const old = listProducts();
    await apiRequest("/products/1", { method: "PUT" });
    const fresh = listProducts();
    resolveOld(new Response('[{"id":1}]'));
    await old;
    const concurrent = listProducts();
    expect(fetchMock).toHaveBeenCalledTimes(3);
    resolveNew(new Response('[{"id":2}]'));
    expect(await fresh).toEqual([{ id: 2 }]);
    expect(await concurrent).toEqual([{ id: 2 }]);
    expect(await listProducts()).toEqual([{ id: 2 }]);
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("respeita no-store mesmo em consultas de catálogo", async () => {
    const fetchMock = vi.fn(async () => new Response('[]'));
    vi.stubGlobal("fetch", fetchMock);
    await apiRequest("/products/", { cache: "no-store" });
    await apiRequest("/products/", { cache: "no-store" });
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
