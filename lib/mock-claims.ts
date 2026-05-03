"use client";

const MOCK_CLAIMS_KEY = "mock_claimed_tasks";

/** Helper to simulate backend assignment functionality */
export function getClaimedProducts(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const data = localStorage.getItem(MOCK_CLAIMS_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

export function claimProduct(productId: string | number, userId: string = "current_user") {
  const claims = getClaimedProducts();
  if (claims[productId.toString()] && claims[productId.toString()] !== userId) {
    throw new Error("Product already claimed by someone else");
  }
  claims[productId.toString()] = userId;
  localStorage.setItem(MOCK_CLAIMS_KEY, JSON.stringify(claims));
}

export function releaseProduct(productId: string | number) {
  const claims = getClaimedProducts();
  delete claims[productId.toString()];
  localStorage.setItem(MOCK_CLAIMS_KEY, JSON.stringify(claims));
}

export function isProductClaimedByMe(productId: string | number, userId: string = "current_user") {
  const claims = getClaimedProducts();
  return claims[productId.toString()] === userId;
}

export function isProductClaimedByOthers(productId: string | number, userId: string = "current_user") {
  const claims = getClaimedProducts();
  const owner = claims[productId.toString()];
  return owner !== undefined && owner !== userId;
}
