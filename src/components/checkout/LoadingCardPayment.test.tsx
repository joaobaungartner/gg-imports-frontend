// @vitest-environment jsdom
import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { LoadingCardPayment } from "./LoadingCardPayment";

const brick = vi.hoisted(() => ({ callbacks: {} as { onReady: () => void; onError: (error: never) => void } }));
vi.mock("@mercadopago/sdk-react", () => ({ CardPayment: (props: typeof brick.callbacks) => {
  brick.callbacks = props;
  return <div>Formulário do cartão</div>;
} }));
afterEach(cleanup);
it("reveals the card form when the SDK is ready", () => {
  render(<LoadingCardPayment initialization={{ amount: 100 }} onSubmit={vi.fn()} />);
  expect(screen.getByRole("status", { name: "Carregando formulário seguro do cartão" })).toBeTruthy();
  act(() => brick.callbacks.onReady());
  expect(screen.queryByRole("status")).toBeNull();
});
it("stops loading and forwards SDK failures", () => {
  const onError = vi.fn();
  render(<LoadingCardPayment initialization={{ amount: 100 }} onSubmit={vi.fn()} onError={onError} />);
  act(() => brick.callbacks.onError({ message: "failed" } as never));
  expect(screen.queryByRole("status")).toBeNull();
  expect(onError).toHaveBeenCalled();
});
