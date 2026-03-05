"use client";

import { cart as cartContent } from "@/../content/cart";
import { contact } from "@/../content/contact";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
      Select,
      SelectContent,
      SelectItem,
      SelectTrigger,
      SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { useDebounce } from "@/hooks/useDebounce";
import { getIdempotencyKey } from "@/lib/idempotency";
import { formatPrice } from "@/lib/utils";
import { PublicConfig, configService } from "@/services/config";
import { OrderPreviewResponse, orderService } from "@/services/orders";
import { PaymentGatewayOption, paymentService } from "@/services/payment";
import { ShippingZone, shippingService } from "@/services/shipping";
import { useCartStore } from "@/store/cart";
import { useCurrencyStore } from "@/store/currency";
import { useMutation } from "@tanstack/react-query";
import {
      AlertCircle,
      Award,
      Check,
      Loader2,
      MapPin,
      Minus,
      Plus,
      ShieldCheck,
      Tag,
      Trash2,
      User,
} from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

type Step = "cart" | "data" | "delivery" | "payment";

interface CustomerData {
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
}

interface DeliveryData {
  method: "pickup" | "shipping";
  pickupBranchId?: string;
  shippingAddress?: {
    street: string;
    city: string;
    state: string;
    zip: string;
    notes?: string;
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
  };
}

export default function CartPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      }
    >
      <CartContent />
    </Suspense>
  );
}

function CartContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      searchParams.get("reloaded") !== "true"
    ) {
      const params = new URLSearchParams(window.location.search);
      params.set("reloaded", "true");
      window.location.replace(`${window.location.pathname}?${params.toString()}`);
    }
  }, [searchParams]);

  const { user, isLoading: isAuthLoading } = useAuth();

  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);

  const { currency } = useCurrencyStore();

  const [currentStep, setCurrentStep] = useState<Step>("cart");
  const [couponCode, setCouponCode] = useState("");
  const [pointsToUse, setPointsToUse] = useState<number>(0);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [deliveryData, setDeliveryData] = useState<DeliveryData>({
    method: "pickup",
  });
  const [preview, setPreview] = useState<OrderPreviewResponse>({
    subtotal: 0,
    discount: 0,
    shipping: 0,
    tax: 0,
    total: 0,
    paymentType: "MERCADO_PAGO",
    items: [],
    stockIssues: [],
  });
  const [stockIssues, setStockIssues] = useState<any[]>([]);
  const hasStockError = useMemo(() => stockIssues.length > 0, [stockIssues]);

  const [customerData, setCustomerData] = useState<CustomerData>(() => {
    if (user) {
      return {
        email: user.email,
        name: user.name || "",
        phone: user.phone || "",
        city: user.city || "",
        zipCode: user.zipCode || "",
        address: user.address || "",
        dni: user.dni || "",
        status: user.status || "",
        country: user.country || "",
        profileImage: user.profileImage || "",
        state: user.state || "",
        points: user.points || 0,
      };
    }
    return {
      email: "",
      name: "",
      phone: "",
      city: "",
      zipCode: "",
      address: "",
      dni: "",
      status: "",
      country: "",
      profileImage: "",
      state: "",
      points: 0,
    };
  });
  const [createAccount, setCreateAccount] = useState(false);

  

  const [nearestBranch, setNearestBranch] = useState<string | null>(null);

  const [shippingZones, setShippingZones] = useState<ShippingZone[]>([]);
  const [storeConfig, setStoreConfig] = useState<PublicConfig | null>(null);

  const [paymentOptions, setPaymentOptions] = useState<PaymentGatewayOption[]>(
    [],
  );
  const [selectedGateway, setSelectedGateway] = useState<string | null>(null);
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);

  useEffect(() => {
    configService.getPublicConfig().then(setStoreConfig).catch(console.error);
    shippingService
      .getAvailableZones()
      .then((zones) => setShippingZones(zones))
      .catch(console.error);
  }, []);

  useEffect(() => {
    const fetchPaymentOptions = async () => {
      if (!currency) return;
      setIsPaymentLoading(true);
      try {
        const options = await paymentService.getPaymentOptions(currency);
        setPaymentOptions(options);

        if (options.length > 0) {
          const primary =
            options.find((o) => o.type === "PRIMARY") || options[0];
          setSelectedGateway(primary.slug);
        }
      } catch (error) {
        if (paymentOptions.length > 0) {
          toast.error("Error al actualizar opciones de pago");
        }
      } finally {
        setIsPaymentLoading(false);
      }
    };

    fetchPaymentOptions();
  }, [currency]);

  const shippingMutation = useMutation({
    mutationFn: async (address: {
      city: string;
      state: string;
      zipCode: string;
      country?: string;
      address?: string;
     
      
    }) => {
      return shippingService.calculateCost({
        ...address,
        items: items.map((item) => ({
          skuId: item.skuId,
          quantity: item.qty,
        })),
      });
    },
    onSuccess: (data) => {
      setPreview((prev) => {
        const newShipping = Number(data.cost);

        const newTotal =
          (prev.subtotal || 0) -
          (prev.discount || 0) -
          (prev.pointsDiscount || 0) +
          (prev.tax || 0) +
          newShipping;
        return { ...prev, shipping: newShipping, total: Math.max(0, newTotal) };
      });
    },
    onError: () => {
      toast.error(cartContent.errors.shipping);
    },
  });

  const prevShippingDepsRef = useRef<string>("");

  useEffect(() => {
    if (
      user &&
      deliveryData.method === "shipping" &&
      deliveryData.shippingAddress?.zip &&
      deliveryData.shippingAddress.state &&
      deliveryData.shippingAddress.city
    ) {
      const currentDeps = JSON.stringify({
         method: deliveryData.method,
         addr: deliveryData.shippingAddress,
      });

      if (currentDeps !== prevShippingDepsRef.current) {
        if (!shippingMutation.isPending) {
          prevShippingDepsRef.current = currentDeps;
          shippingMutation.mutate({
            address: `${deliveryData.shippingAddress.street}, ${deliveryData.shippingAddress.city}, ${deliveryData.shippingAddress.state}`,
            zipCode: deliveryData.shippingAddress.zip,
            city: deliveryData.shippingAddress.city,
            state: deliveryData.shippingAddress.state,
            country: customerData.country,
          });
        }
      }
    }
  }, [
    user,
    deliveryData.method,
    deliveryData.shippingAddress,
    shippingMutation.isPending,
  ]);

  useEffect(() => {
    if (deliveryData.method === "pickup") {
      setPreview((prev) => ({
        ...prev,
        shipping: 0,
        total: Math.max(
          0,
          (prev.subtotal || 0) -
            (prev.discount || 0) -
            (prev.pointsDiscount || 0) +
            (prev.tax || 0),
        ),
      }));
    }
  }, [deliveryData.method]);

  const isAddressValid = useMemo(() => {
    if (shippingZones.length === 0) return true;
    if (!customerData.city) return true;

    return shippingZones.some(
      (z) =>
        (z.country || "Argentina") === customerData.country &&
        z.province === customerData.state &&
        z.city === customerData.city,
    );
  }, [
    shippingZones,
    customerData.country,
    customerData.state,
    customerData.city,
  ]);

  const debouncedItems = useDebounce(items, 300);
  const debouncedPointsToUse = useDebounce(pointsToUse, 500);

  const clientSubtotal = items.reduce(
    (sum, item) => sum + item.price * item.qty,
    0,
  );

  // Prefiltrar datos del cliente si está autenticado
  useEffect(() => {
    if (user) {
      setCustomerData({
        email: user.email,
        name: user.name || "",
        phone: user.phone || "",
        city: user.city || "",
        zipCode: user.zipCode || "",
        address: user.address || "",
        dni: user.dni || "",
        status: user.status || "",
        country: user.country || "",
        profileImage: user.profileImage || "",
        state: user.state || "",
        points: user.points || 0,
      });

      setDeliveryData((prev) => ({
        ...prev,
        shippingAddress: {
          street: user.address || "",
          city: user.city || "",
          state: user.state || "",
          zip: user.zipCode || "",
          notes: "",
        },
      }));
    }
  }, [user]);

  // Previsualización de la orden
  const previewMutation = useMutation({
    mutationFn: async () => {
      return orderService.preview({
        items: debouncedItems.map((item) => ({
          skuId: item.skuId,
          quantity: item.qty,
        })),
        couponCode: appliedCoupon || undefined,
        paymentType: (selectedGateway as any) || "MERCADO_PAGO",
        deliveryMethod: deliveryData.method,
        branchId:
          deliveryData.method === "pickup" ? deliveryData.pickupBranchId : "1",
        pointsToUse: debouncedPointsToUse || undefined,
        currencyCode: currency || undefined,
      });
    },
    onSuccess: (data) => {
      if (data && typeof data.subtotal === "number") {
        // Actualizar previsualización pero mantener el envío anterior momentáneamente o 0, luego re-calcular
        setPreview(data);
      }
      setStockIssues(data?.stockIssues || []);
    },
    onError: () => {
      toast.error(cartContent.errors.preview);
    },
  });

  // Sincronizar precios del carrito cuando cambie la moneda
  const syncWithBackend = useCartStore((state) => state.syncWithBackend);
  useEffect(() => {
    if (currency) {
      syncWithBackend(currency);
    }
    
  }, [currency, syncWithBackend]);


  const dependencyString = useMemo(() => {
    return JSON.stringify({
      items: debouncedItems.map((i) => ({ id: i.skuId, q: i.qty })),
      coupon: appliedCoupon,
      method: deliveryData.method,
      points: debouncedPointsToUse,
      currency: currency,
      gateway: selectedGateway,
    });
  }, [
    debouncedItems,
    appliedCoupon,
    deliveryData.method,
    debouncedPointsToUse,
    currency,
    selectedGateway,
  ]);

  const prevDepsRef = useRef<string>("");

  useEffect(() => {
    if (
      debouncedItems.length > 0 &&
      dependencyString !== prevDepsRef.current
    ) {
      if (!previewMutation.isPending) {
        prevDepsRef.current = dependencyString;
        previewMutation.mutate();
      }
    }
  }, [dependencyString, debouncedItems.length, previewMutation.isPending]);

  const couponMutation = useMutation({
    mutationFn: async (code: string) => {
      return orderService.validateCoupon(
        code,
        clientSubtotal,
        currency || undefined,
      );
    },
    onSuccess: (data) => {
      if (data.valid) {
        setAppliedCoupon(couponCode);
        toast.success(cartContent.step1.coupon.success);
      } else {
        toast.error(data.message || cartContent.step1.coupon.invalid);
      }
    },
    onError: () => {
      toast.error(cartContent.errors.coupon);
    },
  });

  const [isRedirecting, setIsRedirecting] = useState(false);

  const createOrderMutation = useMutation({
    mutationFn: async () => {
      const idempotencyKey = getIdempotencyKey();

      return orderService.create(
        {
          items: items.map((item) => ({
            skuId: item.skuId,
            quantity: item.qty,
          })),
          customer: customerData,
          deliveryMethod: deliveryData.method,
          pickupBranchId: deliveryData.pickupBranchId,
          deliveryAddress:
            deliveryData.method === "shipping"
              ? `${customerData.address}, ${customerData.city}, ${customerData.state}, ${customerData.zipCode}, ${customerData.country}`
              : undefined,
          couponCode: appliedCoupon || undefined,
          pointsToUse,
          createAccount,
          paymentType: (selectedGateway as any) || "MERCADO_PAGO",
        },
        idempotencyKey,
        { headers: { "x-silence-toast": "true" } },
      );
    },
    onError: (error: any) => {
      setIsRedirecting(false);
      const errorMessage = error?.message || cartContent.errors.create;
      toast.error(errorMessage);
    },
    onSuccess: async (data: any) => {
     
      try {
        setIsRedirecting(true);

        const checkoutUrl = data.checkoutUrl;
        const saleId = data.id || data.saleId;

        if (checkoutUrl) {
          window.location.href = checkoutUrl;
        } else if (saleId) {
          router.push(`/profile/orders/${saleId}`);
        } else {
          router.push("/profile/orders");
          setIsRedirecting(false);
        }
      } catch (error) {
        setIsRedirecting(false);
      }
    },
  });

  const handleQuantityChange = (item: any, newQty: number) => {
    if (newQty <= 0) return;
    updateQuantity(item.skuId, newQty, user !== null);
  };

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) return;
    couponMutation.mutate(couponCode);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
  };

  const findNearestBranch = () => {
    if (!navigator.geolocation) {
      toast.error("La geolocalización no es compatible");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        let nearest = contact.branches[0];
        let minDistance = Infinity;

        contact.branches.forEach((branch) => {
          const distance = Math.sqrt(
            Math.pow(branch.coordinates.lat - latitude, 2) +
              Math.pow(branch.coordinates.lng - longitude, 2),
          );

          if (distance < minDistance) {
            minDistance = distance;
            nearest = branch;
          }
        });

        setNearestBranch(nearest.id);
        setDeliveryData((prev) => ({ ...prev, pickupBranchId: nearest.id }));
        toast.success(`Sucursal más cercana: ${nearest.name}`);
      },
      () => {
        toast.error("No se pudo obtener tu ubicación");
      },
    );
  };

  const canProceed = () => {
    switch (currentStep) {
      case "cart":
        return items.length > 0 && !hasStockError;
      case "data":
        return (
          !!customerData.email &&
          !!customerData.name &&
          !!customerData.phone &&
          !!customerData.dni &&
          !!customerData.state &&
          !!customerData.city &&
          !!customerData.address &&
          !!customerData.zipCode &&
          !!customerData.country &&
          isAddressValid
        );
      case "delivery":
        if (deliveryData.method === "pickup") {
          return !!deliveryData.pickupBranchId;
        }
        if (storeConfig && !storeConfig.enableShipping) {
          return false;
        }
        return (
          deliveryData.shippingAddress?.street &&
          deliveryData.shippingAddress?.city &&
          deliveryData.shippingAddress?.state &&
          deliveryData.shippingAddress?.zip
        );
      case "payment":
        return !!selectedGateway;
      default:
        return false;
    }
  };

  const handleNext = () => {
    const steps: Step[] = ["cart", "data", "delivery", "payment"];
    const currentIndex = steps.indexOf(currentStep);

    if (currentStep === "cart" && !user) {
      router.push(`/login?redirect=${encodeURIComponent("/cart?reloaded=true")}`);
      return;
    }

    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleBack = () => {
    const steps: Step[] = ["cart", "data", "delivery", "payment"];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  if (isAuthLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </main>
    );
  }

  const handlePlaceOrder = () => {
    createOrderMutation.mutate();
  };

  if (items.length === 0 && currentStep === "cart") {
    return (
      <main className="min-h-screen py-16 pt-40 max:md:pt-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold mb-4">
            {cartContent.step1.emptyCart}
          </h1>
          <Button onClick={() => router.push("/products")}>
            {cartContent.step1.continueShopping}
          </Button>
        </div>
      </main>
    );
  }
  const isDebouncing = items !== debouncedItems;
  const [forceUnlock, setForceUnlock] = useState(false);
  const isUpdatingRaw =
    previewMutation.isPending ||
    shippingMutation.isPending ||
    couponMutation.isPending ||
    createOrderMutation.isPending;

  useEffect(() => {
    if (isUpdatingRaw) {
      setForceUnlock(false);
      const timer = setTimeout(() => {
        setForceUnlock(true); 
      }, 5000); // 5 segundos de timeout extremo para descongelar UI
      return () => clearTimeout(timer);
    }
  }, [isUpdatingRaw]);

  const isUpdating = isUpdatingRaw && !forceUnlock;

  return (
    <main className="min-h-screen  pb-40 pt-40 md:pt-20 max-sm:top-10 ">
      <div className="container mx-auto px-4 max-w-6xl md:p-20">
        <h1 className="text-4xl font-bold mb-10 text-center bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          {cartContent.title}
        </h1>

      
        <div className="mb-12">
          <div className="flex items-center justify-between max-w-3xl mx-auto relative px-4">
           
            <div className="absolute top-5 left-4 right-4 h-1 bg-muted rounded-full -z-10"></div>

            <div
              className="absolute top-5 left-4 h-1 bg-gradient-to-r from-primary to-secondary rounded-full -z-10 transition-all duration-500"
              style={{
                width: `${(cartContent.stepper.steps.findIndex((s) => s.key === currentStep) / (cartContent.stepper.steps.length - 1)) * 100}%`,
              }}
            ></div>

            {cartContent.stepper.steps.map((step, idx) => {
              const isActive = currentStep === step.key;
              const isCompleted =
                cartContent.stepper.steps.findIndex(
                  (s) => s.key === currentStep,
                ) > idx;

              return (
                <div key={step.id} className="flex flex-col items-center z-10">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-md transition-all duration-300 ${
                      isCompleted
                        ? "bg-gradient-to-r from-primary to-secondary text-white scale-110"
                        : isActive
                          ? "bg-gradient-to-r from-primary to-secondary text-white scale-125 ring-4 ring-primary/20"
                          : "bg-white text-muted-foreground border-2 border-border"
                    }`}
                  >
                    {isCompleted ? <Check className="h-5 w-5" /> : step.id}
                  </div>
                  <span
                    className={`text-xs md:text-sm mt-3 font-medium transition-colors duration-300 ${
                      isActive
                        ? "text-primary font-bold"
                        : "text-muted-foreground"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
       
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6 md:p-8 rounded-[2rem] border-2 border-primary/40 bg-white/60 backdrop-blur-xl shadow-xl shadow-primary/5">
              {/* Step 1: Carrito */}
              {currentStep === "cart" && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent inline-block">
                      {cartContent.step1.title}
                    </h2>
                    {isUpdating && (
                      <div className="flex items-center gap-2 text-primary text-sm font-medium animate-pulse">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Actualizando...
                      </div>
                    )}
                  </div>

                  {hasStockError && (
                    <div className={`mb-6 p-4 rounded-2xl flex items-start gap-4 animate-in fade-in slide-in-from-top-1 transition-all ${isUpdating ? "bg-amber-100 border border-amber-200" : "bg-destructive/10 border border-destructive/20"}`}>
                      {isUpdating ? (
                        <Loader2 className="h-6 w-6 text-amber-600 shrink-0 mt-0.5 animate-spin" />
                      ) : (
                        <AlertCircle className="h-6 w-6 text-destructive shrink-0 mt-0.5" />
                      )}
                      <div>
                        <h4 className={`font-bold ${isUpdating ? "text-amber-800" : "text-destructive"}`}>
                          {isUpdating ? "Validando cantidad..." : "Stock Insuficiente"}
                        </h4>
                        <p className={`text-sm ${isUpdating ? "text-amber-700/80" : "text-destructive/80"}`}>
                          {isUpdating ? "Estamos comprobando la disponibilidad de stock..." : `Algunos artículos en tu carrito no tienen stock suficiente ${deliveryData.method === "pickup" ? "en esta sucursal" : "para envío"}. Por favor, ajusta las cantidades para continuar.`}
                        </p>
                      </div>
                    </div>
                  )}

                  {!user && (
                    <div className="mb-6 p-4 bg-primary/5 border border-primary/20 rounded-xl flex items-center justify-between shadow-sm">
                      <p className="text-sm font-medium text-primary">
                        Inicia sesión para poder procesar tu compra.
                      </p>
                      <Button
                        variant="default"
                        className="rounded-full bg-primary hover:bg-primary/90 text-white"
                        onClick={() => router.push(`/login?redirect=${encodeURIComponent("/cart?reloaded=true")}`)}
                      >
                        Iniciar Sesión
                      </Button>
                    </div>
                  )}

                  <div
                    className={`space-y-4 transition-opacity duration-300 ${isUpdating ? "opacity-60 pointer-events-none" : ""}`}
                  >
                    {items.map((item) => {
                      const stockIssue = stockIssues.find(
                        (s) => s.skuId === parseInt(item.skuId),
                      );
                      const previewItem = preview?.items?.find(
                        (p) => p.skuId === parseInt(item.skuId),
                      );
                      const stockLimit = previewItem?.availableStock;

                      return (
                        <div
                          key={item.skuId}
                          className={`flex max-md:flex-col max-md:items-center gap-6 p-4 mb-4 rounded-xl border transition-all ${
                            stockIssue
                              ? "bg-destructive/5 border-destructive/40 shadow-inner"
                              : "bg-secondary/20 border-white/60 shadow-sm hover:shadow-md"
                          }`}
                        >
                          <div className="relative w-28 h-28 rounded-xl overflow-hidden shadow-inner flex-shrink-0">
                            <Image
                              src={item.productImage}
                              alt={item.productName}
                              fill
                              className="object-cover"
                            />
                          </div>

                          <div className="flex-1 flex flex-col justify-between">
                            <div>
                              <h3 className="font-bold text-lg text-foreground">
                                {item.productName}
                              </h3>

                              {item.attributes &&
                                Object.keys(item.attributes).length > 0 && (
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {Object.entries(item.attributes)
                                      .map(([key, value]) => `${key}: ${value}`)
                                      .join(" / ")}
                                  </p>
                                )}
                            </div>
                            <p className="font-bold text-xl text-primary mt-2">
                              {formatPrice(item.price, currency)}
                              {item.allowFractional && item.measurementUnit && (
                                <span className="text-xs font-normal text-muted-foreground ml-1">
                                  /
                                  {item.measurementUnit === "KG"
                                    ? "kg"
                                    : item.measurementUnit === "LITRO"
                                      ? "L"
                                      : item.measurementUnit === "METRO"
                                        ? "m"
                                        : item.measurementUnit.toLowerCase()}
                                </span>
                              )}
                            </p>
                            {stockIssue && (
                              <p className="text-xs font-bold text-destructive mt-1 flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />
                                Disponible:{" "}
                                {stockIssue.available.toFixed(
                                  item.allowFractional ? 3 : 0,
                                )}{" "}
                                {item.measurementUnit === "KG"
                                  ? "kg"
                                  : item.measurementUnit === "LITRO"
                                    ? "L"
                                    : item.measurementUnit === "METRO"
                                      ? "m"
                                      : "unit."}
                              </p>
                            )}
                          </div>

                          <div className="flex flex-col items-end justify-between gap-4">
                            {item.allowFractional ? (
                              <div className="flex items-center gap-2 bg-white/40 backdrop-blur-sm p-1.5 rounded-2xl border border-white/60">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-9 w-9 rounded-xl hover:bg-white/60 text-primary"
                                  onClick={() => {
                                    const step = item.measurementUnit === "KG" ? 0.1 : item.measurementUnit === "LITRO" ? 0.25 : 0.5;
                                    const newVal = Math.max(step, parseFloat((item.qty - step).toFixed(3)));
                                    handleQuantityChange(item, newVal);
                                  }}
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                                <input
                                  key={`input-${item.skuId}-${item.qty}`}
                                  type="text"
                                  inputMode="decimal"
                                  defaultValue={item.qty}
                                  onBlur={(e) => {
                                    const v = parseFloat(e.target.value.replace(",", "."));
                                    if (!isNaN(v) && v > 0) {
                                      handleQuantityChange(item, v);
                                    } else {
                                      e.target.value = String(item.qty);
                                    }
                                  }}
                                  className="w-14 text-center font-bold text-lg text-primary bg-transparent outline-none"
                                />
                                <span className="text-xs font-bold text-muted-foreground uppercase pr-2">
                                  {item.measurementUnit === "KG"
                                    ? "kg"
                                    : item.measurementUnit === "LITRO"
                                      ? "L"
                                      : item.measurementUnit === "METRO"
                                        ? "m"
                                        : (item.measurementUnit?.toLowerCase() ??
                                          "u")}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-9 w-9 rounded-xl hover:bg-white/60 text-primary"
                                  onClick={() => {
                                    const step = item.measurementUnit === "KG" ? 0.1 : item.measurementUnit === "LITRO" ? 0.25 : 0.5;
                                    const maxVal = stockLimit ?? 9999;
                                    const newVal = Math.min(maxVal, parseFloat((item.qty + step).toFixed(3)));
                                    handleQuantityChange(item, newVal);
                                  }}
                                  disabled={
                                    stockLimit !== undefined &&
                                    item.qty >= stockLimit
                                  }
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-4 bg-white/40 backdrop-blur-sm p-1.5 rounded-2xl border border-white/60">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-9 w-9 rounded-xl hover:bg-white/60 text-primary"
                                  onClick={() =>
                                    handleQuantityChange(
                                      item,
                                      Math.max(1, item.qty - 1),
                                    )
                                  }
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                                <span className="w-8 text-center font-bold text-lg text-primary">
                                  {item.qty}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-9 w-9 rounded-xl hover:bg-white/60 text-primary"
                                  onClick={() =>
                                    handleQuantityChange(item, item.qty + 1)
                                  }
                                  disabled={
                                    stockLimit !== undefined &&
                                    item.qty >= stockLimit
                                  }
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition-colors"
                              onClick={() =>
                                removeItem(item.skuId, user !== null)
                              }
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              {cartContent.step1.removeItem}
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <Separator className="my-6" />

                  {/* Cupón */}
                  {storeConfig?.enableCoupons !== false && (
                    <div className="mt-8 pt-6 border-t border-primary/10">
                      <Label className="mb-2 block">
                        {cartContent.step1.coupon.label}
                      </Label>
                      {appliedCoupon ? (
                        <div className="flex items-center gap-2 p-1 bg-white/50 rounded-full border border-primary/20 pl-4">
                          <span className="font-bold text-primary flex-1">
                            {appliedCoupon}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:bg-destructive/10 rounded-full"
                            onClick={handleRemoveCoupon}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <Input
                            placeholder={cartContent.step1.coupon.placeholder}
                            value={couponCode}
                            onChange={(e) =>
                              setCouponCode(e.target.value.toUpperCase())
                            }
                            disabled={isUpdating}
                            className="rounded-full border-2 border-primary/40 focus:border-primary bg-white/50 backdrop-blur-sm"
                          />
                          <Button
                            onClick={handleApplyCoupon}
                            disabled={
                              couponMutation.isPending ||
                              !couponCode.trim() ||
                              isUpdating
                            }
                            className="rounded-full bg-gradient-to-r from-primary to-secondary text-white shadow-lg hover:shadow-xl transition-all"
                          >
                            {couponMutation.isPending
                              ? cartContent.step1.coupon.applying
                              : cartContent.step1.coupon.apply}
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Canje de puntos */}
                  {user &&
                    user.points > 0 &&
                    storeConfig?.enablePoints &&
                    storeConfig?.enablePointsRedemption && (
                      <div className="mt-8 pt-6 border-t border-primary/10">
                        <div className="flex items-center justify-between mb-4">
                          <Label className="font-bold flex items-center gap-2">
                            <Check className="h-4 w-4 text-amber-500" />
                            Canjear Puntos
                          </Label>
                          <span className="text-sm text-muted-foreground">
                            Disponibles:{" "}
                            <span className="font-bold text-amber-600">
                              {user.points} pts
                            </span>
                          </span>
                        </div>

                        <div className="flex gap-4 items-end">
                          <div className="flex-1">
                            <Input
                              type="number"
                              inputMode="numeric"
                              placeholder="Cantidad de puntos a usar"
                              value={pointsToUse || ""}
                              onChange={(e) => {
                                const val = parseInt(e.target.value) || 0;
                                setPointsToUse(
                                  val > user.points ? user.points : val,
                                );
                              }}
                              disabled={isUpdating}
                              className="h-12 rounded-xl border-2 border-primary/20 focus:border-primary bg-white/50"
                            />
                          </div>
                          {pointsToUse > 0 &&
                            (preview?.pointsDiscount ?? 0) > 0 && (
                              <div className="h-12 flex items-center px-4 bg-amber-50 border-2 border-amber-200 rounded-xl animate-in fade-in zoom-in duration-300">
                                <span className="text-amber-700 font-bold text-sm">
                                  Ahorras:{" "}
                                  {formatPrice(
                                    preview?.pointsDiscount ?? 0,
                                    currency,
                                  )}
                                </span>
                              </div>
                            )}
                          {pointsToUse > 0 && (
                            <Button
                              variant="ghost"
                              className="h-12 rounded-xl text-destructive hover:bg-destructive/10"
                              onClick={() => setPointsToUse(0)}
                              disabled={isUpdating}
                            >
                              Limpiar
                            </Button>
                          )}
                        </div>
                      </div>
                    )}

                  {/* Vista previa de puntos ganados - oculto si los puntos están deshabilitados */}
                  {storeConfig?.enablePoints && (
                    <div className="mt-4 flex items-center gap-2 text-amber-600 font-bold bg-amber-50 p-3 rounded-2xl border border-amber-100 animate-in fade-in duration-500">
                      <Award className="h-4 w-4" />
                      <span>
                        ¡Ganarás{" "}
                        {(() => {
                          // Usar el multiplicador de evento si existe, sino el de la config general, sino 0
                          const pointsRate =
                            storeConfig.activeEvent?.pointsPerCurrency ||
                            storeConfig.pointsPerCurrency ||
                            0.001;

                    
                          return Math.floor(clientSubtotal * pointsRate);
                        })()}{" "}
                        puntos con esta compra!
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Paso 2: Datos */}
              {currentStep === "data" && (
                <div>
                  <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent inline-block">
                    {cartContent.step2.title}
                  </h2>
                  <p className="text-muted-foreground mb-8 text-lg">
                    {cartContent.step2.subtitle}
                  </p>

                  {!user && (
                    <div className="mb-8 p-6 bg-purple-50/50 border border-purple-100 rounded-2xl flex items-center justify-between">
                      <p className="text-sm font-medium text-purple-900">
                        {cartContent.step2.loginPrompt}
                      </p>
                      <Button
                        variant="default"
                        className="rounded-full bg-purple-600 hover:bg-purple-700 "
                        onClick={() => router.push("/login?redirect=/cart")}
                      >
                        {cartContent.step2.loginLink}
                      </Button>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <Label>{cartContent.step2.fields.email.label} *</Label>
                      <Input
                        type="email"
                        inputMode="email"
                        placeholder={cartContent.step2.fields.email.placeholder}
                        value={customerData.email}
                        onChange={(e) =>
                          setCustomerData((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                        disabled={!!user}
                        className="border-2 border-primary/50 focus:border-primary bg-white/50 backdrop-blur-sm"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="font-semibold mb-1.5 block">
                          {cartContent.step2.fields.firstName.label} *
                        </Label>
                        <Input
                          placeholder={
                            cartContent.step2.fields.firstName.placeholder
                          }
                          value={customerData.name}
                          onChange={(e) =>
                            setCustomerData((prev) => ({
                              ...prev,
                              name: e.target.value,
                            }))
                          }
                          className="h-12 rounded-xl border-2 border-primary/40 focus:border-primary bg-white/50"
                        />
                      </div>
                      <div>
                        <Label className="font-semibold mb-1.5 block">
                          {cartContent.step2.fields.phone.label} *
                        </Label>
                        <Input
                          type="tel"
                          inputMode="tel"
                          placeholder={
                            cartContent.step2.fields.phone.placeholder
                          }
                          value={customerData.phone}
                          onChange={(e) =>
                            setCustomerData((prev) => ({
                              ...prev,
                              phone: e.target.value,
                            }))
                          }
                          className="h-12 rounded-xl border-2 border-primary/40 focus:border-primary bg-white/50"
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="font-semibold mb-1.5 block">
                        DNI *
                      </Label>
                      <Input
                        placeholder="12345678"
                        inputMode="numeric"
                        value={customerData.dni}
                        onChange={(e) =>
                          setCustomerData((prev) => ({
                            ...prev,
                            dni: e.target.value,
                          }))
                        }
                        className="h-12 rounded-xl border-2 text-gray-900  border-primary/40 focus:border-primary bg-white/50 placeholder:text-gray-400"
                      />
                    </div>

                    {/* Campos de dirección con jerarquía */}
                    {!isAddressValid &&
                      customerData.city &&
                      shippingZones.length > 0 && (
                        <div className="p-3 mb-4 bg-destructive/10 text-destructive rounded-lg border border-destructive/20 text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
                          <AlertCircle className="h-4 w-4 shrink-0" />
                          <span>
                            La ciudad seleccionada no es válida para envío. Por
                            favor, selecciona una de la lista.
                          </span>
                        </div>
                      )}
                    <div className="space-y-4">
                      {/* Selección de país */}
                      <div>
                        <Label className="font-semibold mb-1.5 block">
                          País *
                        </Label>
                        <Select
                          value={customerData.country}
                          onValueChange={(value) =>
                            setCustomerData((prev) => ({
                              ...prev,
                              country: value,
                              state: "",
                              city: "",
                            }))
                          }
                        >
                          <SelectTrigger className="w-full bg-white/50 backdrop-blur-sm border-primary/40">
                            <SelectValue placeholder="Seleccionar País" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from(
                              new Set(
                                shippingZones
                                  .map((z) => z.country || "Argentina")
                                  .filter(Boolean),
                              ),
                            ).map((c) => (
                              <SelectItem key={c} value={c}>
                                {c}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        {/* Selección de provincia */}
                        <div>
                          <Label className="font-semibold mb-1.5 block">
                            Provincia *
                          </Label>
                          <Select
                            value={customerData.state}
                            onValueChange={(value) =>
                              setCustomerData((prev) => ({
                                ...prev,
                                state: value,
                                city: "",
                              }))
                            }
                            disabled={!customerData.country}
                          >
                            <SelectTrigger className="w-full bg-white/50 backdrop-blur-sm border-primary/40">
                              <SelectValue placeholder="Seleccionar Provincia" />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from(
                                new Set(
                                  shippingZones
                                    .filter(
                                      (z) =>
                                        (z.country || "Argentina") ===
                                        customerData.country,
                                    )
                                    .map((z) => z.province)
                                    .filter(Boolean),
                                ),
                              ).map((p) => (
                                <SelectItem
                                  key={p as string}
                                  value={p as string}
                                >
                                  {p}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Selección de ciudad */}
                        <div>
                          <Label className="font-semibold mb-1.5 block">
                            Ciudad *
                          </Label>
                          <Select
                            value={customerData.city}
                            onValueChange={(value) =>
                              setCustomerData((prev) => ({
                                ...prev,
                                city: value,
                              }))
                            }
                            disabled={!customerData.state}
                          >
                            <SelectTrigger className="w-full bg-white/50 backdrop-blur-sm border-primary/40">
                              <SelectValue placeholder="Seleccionar Ciudad" />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from(
                                new Set(
                                  shippingZones
                                    .filter(
                                      (z) =>
                                        (z.country || "Argentina") ===
                                          customerData.country &&
                                        z.province === customerData.state,
                                    )
                                    .map((z) => z.city)
                                    .filter(Boolean),
                                ),
                              ).map((c) => (
                                <SelectItem
                                  key={c as string}
                                  value={c as string}
                                >
                                  {c}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="font-semibold mb-1.5 block">
                            Dirección *
                          </Label>
                          <Input
                            placeholder="Calle 123"
                            value={customerData.address}
                            onChange={(e) =>
                              setCustomerData((prev) => ({
                                ...prev,
                                address: e.target.value,
                              }))
                            }
                            className="h-12 rounded-xl border-2 border-primary/40 text-gray-900 focus:border-primary bg-white/50 placeholder:text-gray-400"
                          />
                        </div>
                        <div>
                          <Label className="font-semibold mb-1.5 block">
                            Código Postal *
                          </Label>
                          <Input
                            placeholder="1900"
                            inputMode="numeric"
                            value={customerData.zipCode}
                            onChange={(e) =>
                              setCustomerData((prev) => ({
                                ...prev,
                                zipCode: e.target.value,
                              }))
                            }
                            className="h-12 rounded-xl border-2 border-primary/40 focus:border-primary bg-white/50 placeholder:text-gray-400"
                          />
                        </div>
                      </div>
                    </div>

                    {!user && (
                      <div className="flex items-center gap-3 p-4 bg-white/50 rounded-xl border border-primary/10 mt-4">
                        <Checkbox
                          id="create-account"
                          checked={createAccount}
                          onCheckedChange={(checked) =>
                            setCreateAccount(checked as boolean)
                          }
                          className="border-2 border-primary/40 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        />
                        <Label
                          htmlFor="create-account"
                          className="cursor-pointer font-medium cursor-pointer"
                        >
                          {cartContent.step2.createAccount}
                        </Label>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Paso 3: Entrega */}
              {currentStep === "delivery" && (
                <div>
                  <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent inline-block">
                    {cartContent.step3.title}
                  </h2>

                  <RadioGroup
                    value={deliveryData.method}
                    onValueChange={(value) =>
                      setDeliveryData((prev) => ({
                        ...prev,
                        method: value as "pickup" | "shipping",
                      }))
                    }
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                      <Label
                        htmlFor="pickup"
                        className={`flex items-start space-x-3 p-6 border-2 rounded-2xl cursor-pointer transition-all hover:shadow-lg ${
                          deliveryData.method === "pickup"
                            ? "border-primary bg-primary/5 shadow-primary/10"
                            : "border-border bg-white/50 hover:border-primary/40"
                        }`}
                      >
                        <RadioGroupItem
                          value="pickup"
                          id="pickup"
                          className="mt-1"
                        />
                        <div>
                          <p className="font-bold text-lg mb-1">
                            {cartContent.step3.methods.pickup.label}
                          </p>
                          <p className="text-sm text-muted-foreground mb-2 leading-relaxed">
                            {cartContent.step3.methods.pickup.description}
                          </p>
                          <p className="text-sm font-bold text-green-600 bg-green-100 px-2 py-1 rounded inline-block">
                            {cartContent.step3.methods.pickup.free}
                          </p>
                        </div>
                      </Label>

                      {storeConfig?.enableShipping !== false && (
                        <Label
                          htmlFor="shipping"
                          className={`flex items-start space-x-3 p-6 border-2 rounded-2xl cursor-pointer transition-all hover:shadow-lg ${
                            deliveryData.method === "shipping"
                              ? "border-primary bg-primary/5 shadow-primary/10"
                              : "border-border bg-white/50 hover:border-primary/40"
                          }`}
                        >
                          <RadioGroupItem
                            value="shipping"
                            id="shipping"
                            className="mt-1"
                          />
                          <div>
                            <p className="font-bold text-lg mb-1">
                              {cartContent.step3.methods.shipping.label}
                            </p>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {cartContent.step3.methods.shipping.description}
                            </p>
                          </div>
                        </Label>
                      )}
                    </div>
                  </RadioGroup>

                  {deliveryData.method === "pickup" && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="flex justify-between items-center mb-4">
                        <Label className="font-semibold text-lg">
                          {cartContent.step3.methods.pickup.selectBranch}
                        </Label>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={findNearestBranch}
                          className="rounded-full border-primary/30 hover:bg-primary/5"
                        >
                          <MapPin className="h-4 w-4 mr-2 text-primary" />
                          {cartContent.step3.methods.pickup.findNearest}
                        </Button>
                      </div>
                      <div className="space-y-3">
                        {contact.branches.map((branch) => (
                          <Button
                            key={branch.id}
                            variant={
                              deliveryData.pickupBranchId === branch.id
                                ? "secondary"
                                : "outline"
                            }
                            className={`w-full justify-start h-auto py-4 px-6 rounded-xl border-2 transition-all ${
                              deliveryData.pickupBranchId === branch.id
                                ? "border-primary bg-primary/5 hover:bg-primary/10"
                                : "border-transparent bg-white/50 hover:border-primary/30"
                            }`}
                            onClick={() =>
                              setDeliveryData((prev) => ({
                                ...prev,
                                pickupBranchId: branch.id,
                              }))
                            }
                          >
                            <MapPin
                              className={`h-5 w-5 mr-3 shrink-0 ${deliveryData.pickupBranchId === branch.id ? "text-primary" : "text-muted-foreground"}`}
                            />
                            <div className="text-left">
                              <span className="font-bold block text-gray-700">
                                {branch.name}
                              </span>
                              <span className="text-sm text-muted-foreground font-normal">
                                {branch.address}
                              </span>
                            </div>
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {deliveryData.method === "shipping" && (
                    <div className="p-6 bg-white/50 rounded-2xl border border-primary/10 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300 shadow-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="h-5 w-5 text-primary" />
                        <p className="font-bold text-lg">Dirección de Envío</p>
                      </div>
                      <p className="text-lg font-medium ml-7">
                        {customerData.address}
                      </p>
                      <div className="flex gap-2 text-sm text-muted-foreground ml-7">
                        <span>
                          {customerData.city}, {customerData.state}
                        </span>
                        <span>•</span>
                        <span>{customerData.zipCode}</span>
                      </div>
                      <p className="text-sm text-muted-foreground ml-7">
                        {customerData.country}
                      </p>

                      <div className="ml-7 pt-2">
                        {shippingMutation.isPending ? (
                          <p className="text-sm text-primary animate-pulse flex items-center gap-2">
                            <Loader2 className="h-3 w-3 animate-spin" />{" "}
                            Calculando costo de envío...
                          </p>
                        ) : (
                          <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1 rounded-full w-fit">
                            <Check className="h-3 w-3" />
                            <span className="text-xs font-bold">
                              Costo calculado correctamente
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Paso 4: Pago */}
              {currentStep === "payment" && (
                <div>
                  <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent inline-block">
                    {cartContent.step4.title}
                  </h2>
                  <p className="text-muted-foreground mb-8 text-lg">
                    {cartContent.step4.subtitle}
                  </p>

                  <div className="space-y-6">
                    {/* Selección de métodos de pago */}
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                      <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                        <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm">
                          1
                        </span>
                        Selecciona tu método de pago ({currency})
                      </h3>

                      {isPaymentLoading ? (
                        <div className="flex justify-center p-8">
                          <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                      ) : !paymentOptions || paymentOptions.length === 0 ? (
                        <div className="p-4 bg-amber-50 text-amber-800 rounded-xl border border-amber-200">
                          No hay opciones de pago disponibles para esta moneda
                          en este momento.
                        </div>
                      ) : (
                        <RadioGroup
                          value={selectedGateway || ""}
                          onValueChange={setSelectedGateway}
                        >
                          <div className="grid grid-cols-1 gap-3">
                            {paymentOptions.map((option) => (
                              <Label
                                key={option.slug}
                                htmlFor={`gateway-${option.slug}`}
                                className={`flex items-center justify-between p-4 border-2 rounded-xl cursor-pointer transition-all hover:shadow-md ${
                                  selectedGateway === option.slug
                                    ? "border-primary bg-primary/5 shadow-primary/10"
                                    : "border-border bg-white/50 hover:border-primary/30"
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <RadioGroupItem
                                    value={option.slug}
                                    id={`gateway-${option.slug}`}
                                  />
                                  <div className="flex flex-col">
                                    <span className="font-bold text-base md:text-lg">
                                      {option.name}
                                    </span>
                                    {option.type === "PRIMARY" && (
                                      <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full w-fit">
                                        Recomendado
                                      </span>
                                    )}
                                  </div>
                                </div>
                                
                              </Label>
                            ))}
                          </div>
                        </RadioGroup>
                      )}
                    </div>

                    <Separator />

                    <div>
                      <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                        <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm">
                          2
                        </span>
                        {cartContent.step4.deliveryInfo}
                      </h3>
                      <Card className="p-6 rounded-2xl bg-white/50 border border-primary/10 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                            <User className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-bold text-lg">
                              {customerData.name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {customerData.email}
                            </p>
                          </div>
                        </div>

                        <Separator className="my-4" />

                        {deliveryData.method === "pickup" ? (
                          <div className="flex gap-3">
                            <MapPin className="h-5 w-5 text-primary mt-1" />
                            <div>
                              <p className="font-bold mb-1">
                                {cartContent.step4.pickup}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {
                                  contact.branches.find(
                                    (b) => b.id === deliveryData.pickupBranchId,
                                  )?.name
                                }
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {
                                  contact.branches.find(
                                    (b) => b.id === deliveryData.pickupBranchId,
                                  )?.address
                                }
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex gap-3">
                            <MapPin className="h-5 w-5 text-primary mt-1" />
                            <div>
                              <p className="font-bold mb-1">
                                {cartContent.step4.shipping}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {deliveryData.shippingAddress?.street}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {deliveryData.shippingAddress?.city},{" "}
                                {deliveryData.shippingAddress?.state}{" "}
                                {deliveryData.shippingAddress?.zip}
                              </p>
                            </div>
                          </div>
                        )}
                      </Card>
                    </div>

                    <div className="text-sm text-muted-foreground p-4 bg-muted/30 rounded-xl">
                      {cartContent.step4.termsAccept}{" "}
                      <a
                        href="/terms"
                        className="text-primary hover:underline font-medium"
                      >
                        {cartContent.step4.termsLink}
                      </a>{" "}
                      {cartContent.step4.and}{" "}
                      <a
                        href="/privacy"
                        className="text-primary hover:underline font-medium"
                      >
                        {cartContent.step4.privacyLink}
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="p-6 md:p-8 rounded-[2rem] border-2 border-primary/70 bg-white/60 backdrop-blur-xl shadow-xl sticky top-0 overflow-hidden relative">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <span className="w-1 h-6 bg-gradient-to-b from-primary to-secondary rounded-full"></span>
                {cartContent.step1.summary.titulo}
              </h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{cartContent.step1.summary.subtotal}</span>
                  <span className="font-medium text-foreground">
                    {formatPrice(preview?.subtotal || 0, currency)}
                  </span>
                </div>

                {/* Lista de promociones automáticas */}
                {preview?.appliedDiscounts &&
                  preview.appliedDiscounts.length > 0 && (
                    <div className="space-y-1">
                      {preview.appliedDiscounts.map((discount, idx) => (
                        <div
                          key={idx}
                          className="flex justify-between text-xs text-green-600 font-medium bg-green-50/50 p-2 rounded-lg border border-green-100"
                        >
                          <span className="flex items-center gap-1">
                            <Tag className="h-3 w-3" />
                            {discount.name}
                          </span>
                          <span>-${discount.discountAmount.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  )}

                {/* Mensaje de seguridad */}
                {isUpdating && (
                  <div className="absolute inset-0 z-20 bg-white/80 backdrop-blur-[2px] rounded-[2rem] flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
                    <div className="relative mb-4">
                      <Loader2 className="h-12 w-12 animate-spin text-primary/30" />
                      <ShieldCheck className="h-6 w-6 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    </div>
                    <p className="font-bold text-primary mb-1">
                      Cálculo Seguro en Progreso
                    </p>
                    <p className="text-xs text-muted-foreground max-w-[200px]">
                      Validando precios, impuestos y descuentos con precisión
                      total para su seguridad.
                    </p>
                  </div>
                )}

                {/* Cupones o descuento genérico */}
                {storeConfig?.enableCoupons !== false &&
                  preview?.discountDetails && (
                    <div className="flex justify-between text-sm text-green-600 font-medium bg-green-100 p-2 rounded-lg">
                      <span>Cupón: {preview.discountDetails.code}</span>
                      <span>
                        -
                        {formatPrice(
                          preview?.discountDetails?.amount || 0,
                          currency,
                        )}
                      </span>
                    </div>
                  )}

                {storeConfig?.enablePoints &&
                  (preview?.pointsDiscount ?? 0) > 0 && (
                    <div className="flex justify-between text-sm text-amber-600 font-medium bg-amber-50 p-2 rounded-lg">
                      <span>Descuento por Puntos</span>
                      <span>
                        -{formatPrice(preview?.pointsDiscount ?? 0, currency)}
                      </span>
                    </div>
                  )}

                {preview?.shipping > 0 && (
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{cartContent.step1.summary.shipping}</span>
                    <span className="font-medium text-foreground">
                      {formatPrice(preview?.shipping || 0, currency)}
                    </span>
                  </div>
                )}

                {preview?.tax > 0 && (
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{cartContent.step1.summary.tax}</span>
                    <span className="font-medium text-foreground">
                      {formatPrice(preview?.tax || 0, currency)}
                    </span>
                  </div>
                )}
              </div>

              <Separator className="my-6 bg-primary/10" />

              <div className="flex justify-between items-end mb-8 relative">
                <span className="text-lg font-bold text-muted-foreground">
                  {cartContent.step1.summary.total}
                </span>
                <div className="flex flex-col items-end">
                  <span
                    className={`text-3xl font-bold bg-gradient-to-br from-primary to-secondary bg-clip-text text-transparent transition-opacity duration-200 ${isUpdating ? "opacity-30" : "opacity-100"}`}
                  >
                    {formatPrice(preview?.total || 0, currency)}
                  </span>
                  {isUpdating && (
                    <span className="text-[10px] text-primary font-bold animate-pulse absolute -bottom-5 right-0 whitespace-nowrap">
                      Sincronizando con servidor seguro...
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                {currentStep === "payment" ? (
                  <Button
                    className="w-full h-14 text-lg font-bold rounded-full bg-gradient-to-r from-primary to-secondary shadow-lg hover:shadow-xl hover:shadow-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handlePlaceOrder}
                    disabled={
                      createOrderMutation.isPending ||
                      isUpdating ||
                      !selectedGateway ||
                      isRedirecting
                    }
                  >
                    {createOrderMutation.isPending || isRedirecting ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        {isRedirecting
                          ? "Redirigiendo..."
                          : cartContent.step4.placingOrder}
                      </>
                    ) : (
                      cartContent.step4.placeOrder
                    )}
                  </Button>
                ) : (
                  <Button
                    className="w-full h-14 text-lg font-bold rounded-full bg-gradient-to-r from-primary to-secondary shadow-lg hover:shadow-xl hover:shadow-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleNext}
                    disabled={(!user && currentStep === "cart") || !canProceed() || isUpdating}
                  >
                    {isUpdating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Calculando...
                      </>
                    ) : (
                      <>
                        {currentStep === "cart" &&
                          cartContent.step1.summary.proceedToCheckout}
                        {currentStep === "data" &&
                          cartContent.step2.continueButton}
                        {currentStep === "delivery" &&
                          cartContent.step3.continueButton}
                      </>
                    )}
                  </Button>
                )}

                {currentStep !== "cart" && (
                  <Button
                    variant="ghost"
                    className="w-full rounded-full hover:bg-muted font-medium bg-red-200"
                    onClick={handleBack}
                  >
                    Atrás
                  </Button>
                )}
              </div>

              <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <div className="flex gap-2 opacity-50">
                  {/* Iconos de pago */}
                  <div className="w-8 h-5 bg-gray-400 rounded"></div>
                  <div className="w-8 h-5 bg-gray-400 rounded"></div>
                  <div className="w-8 h-5 bg-gray-400 rounded"></div>
                </div>
                <span>Pagos Seguros</span>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
