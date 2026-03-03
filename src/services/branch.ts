import { http } from "@/adapters/http";

export interface Branch {
  id: number;
  name: string;
  address: string;
  phone: string;
  email: string | null;
  city: string | null;
  state: string | null;
  latitude: string | number | null;
  longitude: string | number | null;
  operatingHours: any;
  active: boolean;
}

export const branchService = {
  getAll: async (): Promise<Branch[]> => {
    const res = await http<{ success: boolean; data: Branch[] }>(
      "/api/branches",
    );
    return res.data;
  },
};
