const ALLOWED_REDIRECTS = new Set(["/checkout", "/carrinho"]);

export function resolveRedirectPath(redirect: string | undefined): string {
  if (!redirect) return "/";

  if (!redirect.startsWith("/") || redirect.startsWith("//")) {
    return "/";
  }

  const path = redirect.split("?")[0];
  if (!ALLOWED_REDIRECTS.has(path)) {
    return "/";
  }

  return redirect;
}

export const CHECKOUT_LOGIN_REDIRECT = "/login?redirect=/checkout";
