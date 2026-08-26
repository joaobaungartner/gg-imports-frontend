import { describe, expect, it } from "vitest";
import { formatCurrency } from "./formatCurrency";

describe("formatCurrency", () => {
  it("formata centavos em reais sem perder precisão visual", () => {
    const result = formatCurrency(300.5);
    expect(result).toContain("300,50");
    expect(result).toContain("R$");
  });
});
