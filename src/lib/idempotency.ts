import { v4 as uuidv4 } from "uuid";

const IDEMPOTENCY_KEY = "checkout-idempotency-key";

export const generateIdempotencyKey = (): string => {
  const key = uuidv4();
  if (typeof window !== "undefined") {
    sessionStorage.setItem(IDEMPOTENCY_KEY, key);
  }
  return key;
};

export const getIdempotencyKey = (): string => {
  if (typeof window !== "undefined") {
    const existing = sessionStorage.getItem(IDEMPOTENCY_KEY);
    if (existing) return existing;
  }
  return generateIdempotencyKey();
};

export const clearIdempotencyKey = (): void => {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem(IDEMPOTENCY_KEY);
  }
};
