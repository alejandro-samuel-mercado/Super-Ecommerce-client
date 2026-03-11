import { http } from "@/adapters/http";

export interface PublicConfig {
  storeName: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  socialInstagram: string;
  socialFacebook: string;
  socialTwitter: string;
  logoUrl: string;
  marqueeText: string[];
  bannerImage: any[];
  adImage: string;
  adText: string;
  secondaryAds?: { url: string; link?: string }[];
  openingHours: any;
  activeEvent?: any;

  enablePoints: boolean;
  enableShipping: boolean;
  enablePointsRedemption: boolean;
  enableCoupons?: boolean;
  pointsPerCurrency: number;
  moneyPerPoint: number;
  freeShippingThreshold: number;
  enabledPaymentMethods: string[];
  detectedCurrency?: string;
  taxRate: number;
  baseCurrency: string;
  webSafetyStock: number;
}

export const configService = {
  getPublicConfig: async (): Promise<PublicConfig> => {
    return await http<PublicConfig>("/api/config/public");
  },
};
