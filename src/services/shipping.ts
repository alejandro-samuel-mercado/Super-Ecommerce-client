import { http } from "@/adapters/http";

export interface ShippingZone {
  id: number;
  country: string | null;
  province: string | null;
  city: string | null;
  cost: number;
}

export const shippingService = {
  getAvailableZones: async (): Promise<ShippingZone[]> => {
    return http<ShippingZone[]>("/api/shipping/available-zones");
  },

  calculateCost: async (data: {
    country?: string;
    province?: string;
    city?: string;
    zip?: string;
    items?: any[];
    subtotal?: number;
  }): Promise<{ cost: number; success: boolean }> => {
    return http<{ cost: number; success: boolean }>(
      "/api/shipping/calculate-cost",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
    );
  },
};
