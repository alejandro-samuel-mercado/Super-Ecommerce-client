import { http } from "@/adapters/http";

export interface OrderPreviewRequest {
  items: Array<{
    skuId: string;
    quantity: number;
  }>;
  couponCode?: string;
  shippingAddressId?: string;
  paymentType: "MERCADO_PAGO" | "CASH" | "CARD" | "DEBIT" | "POINTS";
  deliveryMethod?: "pickup" | "shipping";
  branchId?: string;
  pointsToUse?: number;
  currencyCode?: string;
  userId?: number;
  address?: {
    city?: string;
    state?: string;
    country?: string;
    zip?: string;
  } | null;
}

export interface OrderPreviewResponse {
  subtotal: number;
  discount: number;
  pointsDiscount?: number;
  paymentType: "MERCADO_PAGO" | "CASH" | "CARD" | "DEBIT" | "POINTS";
  shipping: number;
  items?: any[];
  tax: number;
  total: number;
  hasStockError?: boolean;
  stockIssues?: any[];
  discountDetails?: {
    code: string;
    type: string;
    value: number;
    amount: number;
    error?: string;
  } | null;
  appliedDiscounts?: any[];
  branchAvailability?: any[];
  totalPointsEarned?: number;
  pointsUsed?: number;
  freeShippingThreshold?: number;
  currencyCode?: string;
}

export interface CreateOrderRequest {
  items: Array<{
    skuId: string;
    quantity: number;
  }>;
  customer: {
    email: string;
    name: string;
    phone: string;
    city: string;
    zipCode: string;
    address: string;
    dni: string;
    status: string;
    country: string;
    profileImage: string;
    state: string;
    points: number;
  };
  deliveryMethod: "pickup" | "shipping";
  pickupBranchId?: string;
  paymentType: "MERCADO_PAGO" | "CASH" | "CARD" | "DEBIT" | "POINTS";
  deliveryAddress?: string;
  address?: {
    city?: string;
    state?: string;
    country?: string;
    zip?: string;
  } | null;
  couponCode?: string;
  pointsToUse?: number;
  createAccount?: boolean;
}

export interface CreateOrderResponse {
  id: number;
  uuid: string;
  orderId?: string;
  checkoutUrl?: string;
}

export interface CouponValidationResponse {
  valid: boolean;
  discount: number;
  type: string;
  message?: string;
}

export const orderService = {
  preview: async (data: OrderPreviewRequest): Promise<OrderPreviewResponse> => {
    const response = await http<{
      success: boolean;
      data: OrderPreviewResponse;
    }>("/api/sales/preview", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return response.data;
  },

  create: async (
    data: CreateOrderRequest,
    idempotencyKey: string,
    options: any = {},
  ): Promise<CreateOrderResponse> => {
    const branchId =
      data.deliveryMethod === "pickup" && data.pickupBranchId
        ? data.pickupBranchId
        : undefined;

    const payload: Record<string, any> = {
      ...data,
      deliveryType: data.deliveryMethod === "pickup" ? "PICKUP" : "DELIVERY",
      paymentType: data.paymentType || "MERCADO_PAGO",
    };
    if (branchId) payload.branchId = branchId;

    const response = await http<{
      success: boolean;
      data: CreateOrderResponse;
    }>("/api/sales/checkout", {
      method: "POST",
      headers: {
        "X-Idempotency-Key": idempotencyKey,
        ...(options.headers || {}),
      },
      body: JSON.stringify(payload),
    });
    return response.data;
  },

  validateCoupon: async (
    code: string,
    amount: number,
    currencyCode?: string,
    userId?: number,
  ): Promise<CouponValidationResponse> => {
    const response = await http<{ success: boolean; data: any }>(
      "/api/coupons/validate",
      {
        method: "POST",
        body: JSON.stringify({ code, amount, currencyCode, userId }),
      },
    );

    
    const data = response.data;
    return {
      valid: !!(data && data.id),
      discount: data?.discountAmount || 0,
      type: data?.type || "",
      message: "",
    };
  },

  getById: async (id: string | number): Promise<any> => {
    const response = await http<{ success: boolean; data: any }>(
      `/api/sales/${id}`,
    );
    return response.data;
  },

  getGuestOrder: async (uuid: string): Promise<any> => {
    const response = await http<{ success: boolean; data: any }>(
      `/api/sales/guest/${uuid}`,
    );
    return response.data;
  },

  getMySales: async (params?: { includePending?: boolean }): Promise<any[]> => {
    const query = new URLSearchParams();
    if (params?.includePending !== undefined) {
      query.append("includePending", String(params.includePending));
    }
    const response = await http<{ success: boolean; data: any[] }>(
      `/api/sales/my-sales?${query.toString()}`,
    );
    return response.data;
  },
};
