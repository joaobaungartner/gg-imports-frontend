type UnauthorizedHandler = () => void;

let unauthorizedHandler: UnauthorizedHandler | null = null;
let isHandlingUnauthorized = false;

export function setUnauthorizedHandler(handler: UnauthorizedHandler | null) {
  unauthorizedHandler = handler;
}

export function handleUnauthorized() {
  if (isHandlingUnauthorized || !unauthorizedHandler) {
    return;
  }

  isHandlingUnauthorized = true;
  unauthorizedHandler();

  window.setTimeout(() => {
    isHandlingUnauthorized = false;
  }, 1000);
}
