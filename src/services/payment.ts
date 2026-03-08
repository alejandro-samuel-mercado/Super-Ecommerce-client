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
    country?: string,
  ): Promise<PaymentGatewayOption[]> => {
    try {
      let url = `/api/payments/options?currency=${currency}`;
      if (country) {
        url += `&country=${encodeURIComponent(country)}`;
      }
      const response = await http<{
        success: boolean;
        data: PaymentGatewayOption[];
      }>(url, {
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
