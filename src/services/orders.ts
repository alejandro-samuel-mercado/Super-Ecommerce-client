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
}

export interface OrderPreviewResponse {
  subtotal: number;
  discount: number;
  pointsDiscount?: number;
  paymentType: "MERCADO_PAGO" | "CASH" | "CARD" | "DEBIT" | "POINTS";
  shipping: number;
  items?: Array<{
    skuId: number;
    quantity: number;
    availableStock: number;
    unitPrice: number;
  }>;
  tax: number;
  total: number;
  hasStockError?: boolean;
  stockIssues?: Array<{
    skuId: number;
    skuCode: string;
    productName: string;
    available: number;
    requested: number;
  }>;
  discountDetails?: {
    code: string;
    type: string;
    value: number;
    amount: number;
  };
  appliedDiscounts?: Array<{
    id: number;
    name: string;
    type: string;
    val: number;
    discountAmount: number;
  }>;
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
        : "1";

    const payload = {
      ...data,
      deliveryType: data.deliveryMethod === "pickup" ? "PICKUP" : "DELIVERY",
      paymentType: data.paymentType || "MERCADO_PAGO", 
      branchId,
    };

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
  ): Promise<CouponValidationResponse> => {
    const response = await http<{ success: boolean; data: any }>(
      "/api/coupons/validate",
      {
        method: "POST",
        body: JSON.stringify({ code, amount, currencyCode }),
      },
    );

    return {
      valid: true,
      discount: response.data.discountAmount,
      type: response.data.type,
    };
  },

  getById: async (id: string | number): Promise<any> => {
    const response = await http<{ success: boolean; data: any }>(
      `/api/sales/${id}`,
    );
    return response.data;
  },
};
