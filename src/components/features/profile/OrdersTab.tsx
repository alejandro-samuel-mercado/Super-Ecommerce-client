"use client";

import { profile } from "@/../content/profile";
import { http } from "@/adapters/http";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { formatPrice } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { Download, Eye, ReceiptText } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function OrdersTab() {
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isDownloading, setIsDownloading] = useState<string | null>(null);

  const { data: orders, isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const response = await http<{ success: boolean; data: any[] }>(
        "/api/sales/my-purchases",
      );
      // Mapeo preventivo para compatibilidad con el modelo del Backend
      return response.data.map((order) => ({
        ...order,
        status: order.paymentStatus, 
        shipping: order.shippingCost || 0, 
        tax: order.taxAmount || 0, 
        items: order.items.map((item: any) => ({
          ...item,
          price: item.unitPrice,
        })),
      }));
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-28 bg-primary/5 animate-pulse rounded-3xl"
          />
        ))}
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PAID":
        return "default";
      case "PENDING":
        return "outline";
      case "CANCELLED":
      case "REJECTED":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getDeliveryColor = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return "default";
      case "SHIPPED":
        return "secondary";
      case "REQUIRES_ACTION":
        return "destructive";
      case "PENDING_DELIVERY":
        return "outline";
      default:
        return "outline";
    }
  };

  const handleDownload = async (orderId: string) => {
    setIsDownloading(orderId);
    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(`${baseUrl}/api/sales/${orderId}/invoice`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });

      if (!response.ok) throw new Error("Failed to download invoice");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `factura-${orderId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success("Factura descargada");
    } catch (error) {
      toast.error("Error al descargar factura");
    } finally {
      setIsDownloading(null);
    }
  };

  return (
    <div className="space-y-6">
      {!orders || orders.length === 0 ? (
        <div className="text-center py-12 bg-primary/5 rounded-[2.5rem] border-2 border-dashed border-primary/10">
          <p className="text-muted-foreground font-medium">
            {profile.orders.noOrders}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card
              key={order.id}
              className="p-6 border-4 border-primary/40 rounded-[2rem] bg-card/50 backdrop-blur-sm transition-all hover:shadow-xl hover:translate-x-1 group"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="space-y-1">
                  <p className="font-black text-primary tracking-tighter">
                    ORDEN #{order.id}
                  </p>
                  <p className="text-xs text-muted-foreground font-bold flex items-center gap-2">
                    <span className="h-1 w-1 bg-primary rounded-full" />
                    {new Date(order.createdAt).toLocaleDateString("es-AR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={getStatusColor(order.status)}
                    className="rounded-full px-4 py-1 font-black text-[10px] tracking-widest uppercase"
                  >
                    {profile.orders.statuses[
                      order.status as keyof typeof profile.orders.statuses
                    ] || order.status}
                  </Badge>
                  {order.deliveryStatus && (
                    <Badge
                      variant={getDeliveryColor(order.deliveryStatus)}
                      className="rounded-full px-4 py-1 font-black text-[10px] tracking-widest uppercase"
                    >
                      {profile.orders.statuses[
                        order.deliveryStatus as keyof typeof profile.orders.statuses
                      ] || order.deliveryStatus}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">
                    {order.items.length}{" "}
                    {order.items.length === 1 ? "ARTÍCULO" : "ARTÍCULOS"}
                  </p>
                  <p className="text-2xl font-black text-foreground tracking-tighter">
                    {formatPrice(order.total, order.currencyCode)}
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="h-12 w-12 rounded-2xl border-2 border-primary/40 hover:bg-primary/10 hover:border-primary transition-all p-0"
                    onClick={() => setSelectedOrder(order)}
                    title={profile.orders.viewDetailsButton}
                  >
                    <Eye className="h-5 w-5 text-primary" />
                  </Button>
                  <Button
                    variant="outline"
                    className="h-12 w-12 rounded-2xl border-2 border-primary/40 hover:bg-primary/10 hover:border-primary transition-all p-0 disabled:opacity-50"
                    onClick={() => handleDownload(order.id.toString())}
                    disabled={isDownloading === order.id.toString()}
                    title={profile.orders.downloadButton}
                  >
                    {isDownloading === order.id.toString() ? (
                      <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Download className="h-5 w-5 text-primary" />
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog
        open={!!selectedOrder}
        onOpenChange={() => setSelectedOrder(null)}
      >
        <DialogContent className="max-w-2xl rounded-[3rem] border-4 border-primary/20 bg-card/95 backdrop-blur-2xl p-0 overflow-hidden">
          <DialogHeader className="p-8 pb-0">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <ReceiptText size={20} />
              </div>
              <DialogTitle className="text-2xl font-black tracking-tighter uppercase">
                Detalles de la Orden
              </DialogTitle>
            </div>
            <p className="text-xs font-bold text-muted-foreground tracking-widest uppercase">
              Transacción Verificada #{selectedOrder?.id}
            </p>
          </DialogHeader>

          {selectedOrder && (
            <div className="p-8 pt-6 space-y-8">
              <div className="grid grid-cols-2 gap-8 py-6 border-y border-primary/5">
                <div>
                  <p className="text-[10px] text-primary/60 font-black tracking-[0.4em] mb-2">
                    ESTADO PAGO
                  </p>
                  <Badge
                    variant={getStatusColor(selectedOrder.status)}
                    className="rounded-full px-4 font-black"
                  >
                    {profile.orders.statuses[
                      selectedOrder.status as keyof typeof profile.orders.statuses
                    ] || selectedOrder.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-[10px] text-primary/60 font-black tracking-[0.4em] mb-2">
                    ESTADO ENVÍO
                  </p>
                  <Badge
                    variant={getDeliveryColor(selectedOrder.deliveryStatus)}
                    className="rounded-full px-4 font-black"
                  >
                    {profile.orders.statuses[
                      selectedOrder.deliveryStatus as keyof typeof profile.orders.statuses
                    ] || selectedOrder.deliveryStatus}
                  </Badge>
                </div>
                <div>
                  <p className="text-[10px] text-primary/60 font-black tracking-[0.4em] mb-2">
                    MÉTODO PAGO
                  </p>
                  <p className="text-xs font-black uppercase text-foreground bg-primary/5 w-max px-3 py-1 rounded-full">
                    {selectedOrder.paymentType?.replace("_", " ")}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-[10px] text-primary/60 font-black tracking-[0.4em] mb-6 border-b border-primary/5 pb-2">
                  PRODUCTOS
                </p>
                <div className="space-y-4 max-h-[30vh] overflow-y-auto pr-2 custom-scrollbar">
                  {selectedOrder.items.map((item: any, idx: number) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center py-3 group hover:bg-primary/5 transition-all rounded-2xl px-3 -mx-3"
                    >
                      <div>
                        <p className="font-black text-sm tracking-tight group-hover:text-primary transition-colors">
                          {item.productName}
                        </p>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5">
                          Cant:{" "}
                          {Number(item.quantity).toFixed(
                            item.measurementUnit &&
                              item.measurementUnit !== "UNIDAD"
                              ? 3
                              : 0,
                          )}
                          <span className="ml-1">
                            {item.measurementUnit === "KG"
                              ? "kg"
                              : item.measurementUnit === "LITRO"
                                ? "L"
                                : item.measurementUnit === "METRO"
                                  ? "m"
                                  : "u"}
                          </span>
                        </p>
                      </div>
                      <p className="font-black text-primary">
                        {formatPrice(
                          item.price * item.quantity,
                          selectedOrder.currencyCode,
                        )}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-primary/5 p-8 rounded-[2rem] space-y-3">
                <div className="flex justify-between text-[11px] font-black tracking-widest text-primary/60 uppercase">
                  <span>Subtotal</span>
                  <span className="text-foreground">
                    {formatPrice(
                      selectedOrder.subtotal,
                      selectedOrder.currencyCode,
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-[11px] font-black tracking-widest text-primary/60 uppercase">
                  <span>Envío</span>
                  <span className="text-foreground">
                    {formatPrice(
                      selectedOrder.shipping,
                      selectedOrder.currencyCode,
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-[11px] font-black tracking-widest text-secondary uppercase">
                  <span>Descuentos</span>
                  <span>
                    -
                    {formatPrice(
                      selectedOrder.discount,
                      selectedOrder.currencyCode,
                    )}
                  </span>
                </div>
                <div className="flex justify-between pt-4 border-t-2 border-primary/10 items-end">
                  <span className="text-sm font-black text-primary tracking-widest uppercase mb-1">
                    Total Final
                  </span>
                  <span className="text-3xl font-black text-primary tracking-tighter">
                    {formatPrice(
                      selectedOrder.total,
                      selectedOrder.currencyCode,
                    )}
                  </span>
                </div>
              </div>

              <div className="flex gap-4 pt-4 pb-4">
                <Button
                  className="flex-1 h-14 rounded-2xl font-black bg-primary text-white hover:bg-secondary transition-all gap-2"
                  onClick={() => handleDownload(selectedOrder.id.toString())}
                  disabled={isDownloading === selectedOrder.id.toString()}
                >
                  {isDownloading === selectedOrder.id.toString() ? (
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Download size={18} />
                      DESCARGAR PDF
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
