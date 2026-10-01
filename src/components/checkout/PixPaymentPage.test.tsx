// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { PixPaymentPage } from "./PixPaymentPage";

const mocks = vi.hoisted(() => ({ order: vi.fn(), payment: vi.fn(), copy: vi.fn() }));
vi.mock("@/lib/api", () => ({ getOrderById: mocks.order, getPaymentByOrder: mocks.payment }));
vi.mock("@tanstack/react-router", () => ({ Link: ({ children }: { children: React.ReactNode }) => <a>{children}</a> }));
beforeEach(() => {
  vi.useFakeTimers();
  vi.resetAllMocks();
  mocks.order.mockResolvedValue({ id: 2, status: "PENDING_PAYMENT", payment_method: "PIX", valor_total: "177.90" });
  mocks.payment.mockResolvedValue({ status: "PENDING", pix_qr_code: "pix-code", pix_qr_code_base64: "image" });
  Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: mocks.copy } });
});
afterEach(() => { cleanup(); vi.useRealTimers(); });
async function openPage() { await act(async () => { render(<PixPaymentPage orderId={2} />); }); }

it("shows skeletons only until the first payment response arrives", async () => {
  let resolvePayment!: (value: unknown) => void;
  mocks.payment.mockReturnValueOnce(new Promise(resolve => { resolvePayment = resolve; }));
  await openPage();
  expect(screen.getByRole("status", { name: "Carregando pagamento" })).toBeTruthy();
  expect(screen.queryByText("Copiar código Pix")).toBeNull();
  await act(async () => { resolvePayment({ status: "PENDING", pix_qr_code: "pix-code" }); });
  expect(screen.queryByRole("status", { name: "Carregando pagamento" })).toBeNull();
  expect(screen.getByText("Copiar código Pix")).toBeTruthy();
  mocks.payment.mockReturnValueOnce(new Promise(() => {}));
  await act(async () => { await vi.advanceTimersByTimeAsync(10000); });
  expect(screen.getByText("Copiar código Pix")).toBeTruthy();
  expect(screen.queryByRole("status", { name: "Carregando pagamento" })).toBeNull();
});

it("replaces initial skeletons with an error when loading fails", async () => {
  mocks.payment.mockRejectedValue(new Error("offline"));
  await openPage();
  expect(screen.getByRole("alert")).toBeTruthy();
  expect(screen.queryByRole("status", { name: "Carregando pagamento" })).toBeNull();
});

it("shows the QR code immediately and copies the Pix code", async () => {
  await openPage();
  expect(screen.getByAltText("QR Code para pagamento Pix")).toBeTruthy();
  await act(async () => { fireEvent.click(screen.getByText("Copiar código Pix")); });
  expect(mocks.copy).toHaveBeenCalledWith("pix-code");
  expect(screen.getByText("Código copiado!")).toBeTruthy();
});

it("confirms payment after polling and removes the QR code", async () => {
  await openPage();
  mocks.order.mockResolvedValue({ id: 2, status: "PAID", payment_method: "PIX" });
  await act(async () => { await vi.advanceTimersByTimeAsync(10000); });
  expect(screen.getByText("Pagamento confirmado!")).toBeTruthy();
  expect(screen.queryByAltText("QR Code para pagamento Pix")).toBeNull();
  await act(async () => { await vi.advanceTimersByTimeAsync(10000); });
  expect(mocks.order).toHaveBeenCalledTimes(2);
});

it("hides an expired code", async () => {
  mocks.payment.mockResolvedValue({ status: "PENDING", pix_qr_code: "expired", expires_at: "2020-01-01T00:00:00Z" });
  await openPage();
  expect(screen.getByText(/Este código Pix expirou/)).toBeTruthy();
  expect(screen.queryByText("Copiar código Pix")).toBeNull();
});

it("keeps a manual copy option when clipboard permission fails", async () => {
  mocks.copy.mockRejectedValue(new Error("denied"));
  await openPage();
  await act(async () => { fireEvent.click(screen.getByText("Copiar código Pix")); });
  expect(screen.getByRole("alert").textContent).toContain("Selecione e copie");
  expect((screen.getByLabelText("Pix copia e cola") as HTMLTextAreaElement).value).toBe("pix-code");
});
