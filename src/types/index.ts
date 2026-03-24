export interface User {
  id: number;
  email: string;
  name: string;
  phone: string | null;
  city: string | null;
  zipCode: string | null;
  address: string | null;
  dni: string | null;
  status: string;
  country: string | null;
  province: string | null;
  profileImage: string | null;
  state: string | null;
  points: number;
  role:
    | "USER"
    | "ADMIN"
    | "SUPER_ADMIN"
    | "CUSTOMER"
    | "EMPLOYEE"
    | { id: number; name: string; description?: string };
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  children?: Category[];
}

export interface Product {
  id: number;
  slug: string;
  name: string;
  brand: string;
  qr: string | null;
  description: string;
  basePrice: number;

  pointsReward: number;
  images: string[];
  categoryId: number;
  category?: Category;
  skus: SKU[];
  condition: string;
  isTrending: boolean;
  isNew: boolean;
  isRecommended: boolean;
  measurementUnit: string;
  allowFractional: boolean;
  items?: OrderItemSnapshot[];
  createdAt: string;
  comments?: Comment[];
  averageRating?: number;
  ratingCount?: number;
  price?: number;
  discountedPrice?: number;
  discountPercentage?: number;
  currencyCode?: string;
  currencySymbol?: string;
  model?: string;
  characteristics?: { key: string; value: string }[];
  specifications?: { key: string; value: string }[];
}

export interface Comment {
  id: number;
  content: string;
  rating: number;
  userId: number;
  productId: number;
  createdAt: string;
  user: {
    name: string;
    avatar?: string;
  };
}

export interface SKU {
  id: number;
  productId: number;
  name: string;
  code: string;
  price: number;
  stock: number;
  variantOptions: VariantOption[];
}

export interface VariantOption {
  id: number;
  name: string;
  value: string;
  skuId: number;
}

export interface CartItem {
  skuId: string;
  qty: number;
  productId: number;
  productName: string;
  productImage: string;
  price: number;
  attributes: Record<string, string>;
  allowFractional?: boolean;
  measurementUnit?: string;
  currencyCode?: string;
  currencySymbol?: string;
}

export interface Address {
  id?: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone: string;
}

export interface ShippingCost {
  method: string;
  price: number;
  estimatedDays: number;
}

export interface Discount {
  code: string;
  type: "PERCENTAGE" | "FIXED";
  value: number;
}

export interface OrderItemSnapshot {
  skuId: number;
  productId: number;
  productName: string;
  price: number;
  quantity: number;
  productImage: string;
  attributes: Record<string, string>;
  measurementUnit?: string;
}

export interface Order {
  id: number;
  userId: number;
  items: OrderItemSnapshot[];
  total: number;
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  status: "PENDING" | "PAID" | "CANCELLED" | "REJECTED";
  paymentType: "CASH" | "CARD" | "POINTS" | "DEBIT" | "MERCADO_PAGO" | "QR";
  deliveryType: "PICKUP" | "DELIVERY";
  deliveryStatus: "PENDING_DELIVERY" | "SHIPPED" | "DELIVERED";
  currencyCode: string;
  exchangeRateAtPurchase: number;
  totalInBaseCurrency: number;
  qrPaymentUrl?: string | null;
  createdAt: string;
}

export interface OrderPreview {
  subtotal: number;
  userId: number;
  shipping: number;
  discount: number;
  total: number;
  items: any[];
  tax: number;
  currencyCode?: string;
  currencySymbol?: string;
  discountDetails?: {
    code?: string;
    type?: string;
    value?: number;
    amount?: number;
    error?: string;
  } | null;
  appliedDiscounts?: any[];
  stockIssues?: any[];
  hasStockError?: boolean;
  pointsDiscount?: number;
  totalPointsEarned?: number;
  pointsUsed?: number;
}

export interface SearchResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiError {
  status: number;
  code: string;
  message: string;
  details?: unknown;
  referenceId?: string;
}

export interface BlogPost {
  id?: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  search: string;
  author?: {
    name: string;
    avatar: string;
    bio: string;
  };
  authorName?: string;
  authorAvatar?: string;
  authorBio?: string;
  tags: string[];
  publishedAt: string;
  createdAt?: string;
  readingTime: number;
  published?: boolean;
}
