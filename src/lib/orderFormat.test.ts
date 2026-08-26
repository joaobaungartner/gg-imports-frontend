import { describe, expect, it } from "vitest";
import {
  customerStatusMessage, formatOrderStatus, formatPaymentMethod,
  formatShippingMethod, isCriticalStatusTransition,
} from "./orderFormat";

describe("formatação do pedido", () => {
  it("traduz estados comerciais conhecidos", () => {
    expect(formatOrderStatus("PENDING_PAYMENT")).toBe("Aguardando pagamento");
    expect(formatOrderStatus("SHIPPED")).toBe("Enviado");
    expect(customerStatusMessage("PAID")).toContain("confirmado");
  });

  it("preserva estados desconhecidos para diagnóstico", () => {
    expect(formatOrderStatus("GATEWAY_REVIEW")).toBe("GATEWAY_REVIEW");
  });

  it("formata métodos e identifica transições críticas", () => {
    expect(formatPaymentMethod("PIX")).toBe("Pix");
    expect(formatShippingMethod("RETIRADA")).toBe("Retirada");
    expect(isCriticalStatusTransition("PAID", "CANCELED")).toBe(true);
    expect(isCriticalStatusTransition("PAID", "PREPARING")).toBe(false);
  });
});
