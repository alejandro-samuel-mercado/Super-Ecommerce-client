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
  enablePersistentQr?: boolean;
  persistentQrUrl?: string;
  country: string;
  defaultCurrency: string;
  institutionalVideo?: string;
  institutionalVideoTitle?: string;
  whatsappProductMessage?: string;
  navItemName?: string;
  customPageTitle?: string;
  customPageDescription?: string;
  customPageImage?: string;
  customPageVideo?: string;
  customPageImages?: string[];
  customPageVideos?: string[];
  customPageTexts?: string[];
  customPageTextsSubtitle?: string;
  customPageImagesSubtitle?: string;
  customPageVideosSubtitle?: string;
  themeColors?: Record<string, string>;
}

export const configService = {
  getPublicConfig: async (): Promise<PublicConfig> => {
    return await http<PublicConfig>("/api/config/public");
  },
};
