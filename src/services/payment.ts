import { http } from "@/adapters/http";

export interface PaymentGatewayOption {
  id: number;
  name: string;
  slug: string;
  type: "PRIMARY" | "FALLBACK";
  isFallback: boolean;
  logoUrl?: string;
}

export interface InitiatePaymentResponse {
  success: boolean;
  initPoint: string;
}

export const paymentService = {
  getPaymentOptions: async (
    currency: string,
  ): Promise<PaymentGatewayOption[]> => {
    try {
      const response = await http<{
        success: boolean;
        data: PaymentGatewayOption[];
      }>(`/api/payments/options?currency=${currency}`, {
        method: "GET",
      });
      return response?.data || [];
    } catch (error) {
      return [];
    }
  },

  initiatePayment: async (
    saleId: number | string,
    gatewaySlug?: string,
  ): Promise<InitiatePaymentResponse> => {
    const payload: any = { saleId };
    if (gatewaySlug) {
      payload.gatewaySlug = gatewaySlug;
    }

    const response = await http<InitiatePaymentResponse>(
      "/api/payments/initiate",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    );
    return response;
  },
};
