type TokenGetter = (forceRefresh?: boolean) => Promise<string | null>;

let tokenGetter: TokenGetter | null = null;
let onUnauthorized: (() => void) | null = null;


export function registerTokenGetter(getter: TokenGetter): void {
  tokenGetter = getter;
}

export function registerUnauthorizedHandler(handler: () => void): void {
  onUnauthorized = handler;
}

export async function getAccessToken(forceRefresh = false): Promise<string | null> {
  if (!tokenGetter) return null;
  try {
    return await tokenGetter(forceRefresh);
  } catch {
    return null;
  }
}

export function notifyUnauthorized(): void {
  onUnauthorized?.();
}
