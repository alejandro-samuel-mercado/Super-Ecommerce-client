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
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Clock, Download, Eye, History, Package, QrCode, ReceiptText, Upload, XCircle } from "lucide-react";
import { useRouter } from "next/router";

import React, { useRef, useState } from "react";
import { toast } from "sonner";

export function OrdersTab() {
    const router = useRouter;
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [isDownloading, setIsDownloading] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadOrder, setUploadOrder] = useState<any>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const queryClient = useQueryClient();

    const { data: orders, isLoading } = useQuery({
        queryKey: ["orders"],
        queryFn: async () => {
            const response = await http<{ success: boolean; data: any[] }>(
                "/api/sales/my-purchases?includePending=true",
            );

            if (!response.data) return [];

            // Mapeo preventivo para compatibilidad con el modelo del Backend
            return response.data.map((order) => ({
                ...order,
                status: order.paymentStatus,
                shipping: order.shippingCost || 0,
                tax: order.taxAmount || 0,
                items: (order.items || []).map((item: any) => ({
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

    const getStatusDetails = (order: any) => {
        const status = order.paymentStatus;
        const mpPaymentId = order.mpPaymentId;
        const paymentType = order.paymentType;

        switch (status) {
            case "PAID":
                return { color: "default" as const, label: "Pagado" };
            case "PENDING":
                if (paymentType !== 'CASH' && paymentType !== 'TRANSFER' && paymentType !== 'QR') {
                    if (mpPaymentId) {
                        return { color: "secondary" as const, label: "Pago en Proceso", className: "bg-blue-100 text-blue-800 border-blue-200" };
                    }
                    return { color: "outline" as const, label: "Incompleto / Abandonado", className: "text-muted-foreground italic" };
                }
                return { color: "outline" as const, label: paymentType === 'QR' ? "Esperando Pago QR" : "Pendiente de Pago" };
            case "CANCELLED":
            case "REJECTED":
                return { color: "destructive" as const, label: status === "CANCELLED" ? "Cancelado" : "Rechazado" };
            default:
                return { color: "secondary" as const, label: status };
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
            const blob = await http<Blob>(`/api/sales/${orderId}/invoice`, {
                method: "GET",
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `factura-${orderId}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            toast.success("Factura descargada con éxito");
        } catch (error: any) {
            toast.error(error.message || "Error al descargar la factura");
        } finally {
            setIsDownloading(null);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.size > 5 * 1024 * 1024) {
                toast.error("El archivo es demasiado grande (máx 5MB)");
                return;
            }
            setSelectedFile(file);
        }
    };

    const handleUploadProof = async () => {
        if (!selectedFile || !uploadOrder) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append("image", selectedFile);

        try {
            await http(`/api/sales/${uploadOrder.id}/payment-proof`, {
                method: "POST",
                body: formData,
            });


            setUploadOrder(null);
            setSelectedFile(null);
            queryClient.invalidateQueries({ queryKey: ["orders"] });
        } catch (error: any) {
            toast.error(error.message || "Error al subir el comprobante");
        } finally {
            setIsUploading(false);
        }
    };

    const handleDeleteProof = async (orderId: number) => {
        if (!confirm("¿Estás seguro de que deseas eliminar el comprobante?")) return;

        try {
            await http(`/api/sales/${orderId}/payment-proof`, {
                method: "DELETE",
            });
            toast.success("Comprobante eliminado");
            queryClient.invalidateQueries({ queryKey: ["orders"] });
        } catch (error: any) {
            toast.error(error.message || "Error al eliminar el comprobante");
        }
    };

    const pendingOrders = orders?.filter(o => {
        const isAbandoned = o.paymentStatus === 'PENDING' &&
            o.paymentType === 'MERCADO_PAGO' &&
            !o.mpPaymentId;
        if (isAbandoned) return false;

        return o.paymentStatus === 'PENDING' ||
            (o.paymentStatus === 'PAID' && o.deliveryStatus !== 'DELIVERED');
    }) || [];

    const finishedOrders = orders?.filter(o =>
        (o.paymentStatus === 'PAID' && o.deliveryStatus === 'DELIVERED') ||
        o.paymentStatus === 'CANCELLED' ||
        o.paymentStatus === 'REJECTED'
    ) || [];

    return (
        <div className="space-y-12">
            {!orders || orders.length === 0 ? (
                <div className="text-center py-20 bg-primary/5 rounded-[3rem] border-4 border-dashed border-primary/10">
                    <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Package size={40} className="text-primary/40" />
                    </div>
                    <p className="text-xl font-black text-primary tracking-tight">
                        {profile.orders.noOrders}
                    </p>
                    <p className="text-sm text-muted-foreground mt-2 max-w-xs mx-auto">
                        Aún no has realizado ninguna compra en nuestra tienda.
                    </p>
                </div>
            ) : (
                <div className="space-y-12">
                    {/* SECCIÓN: PEDIDOS EN PROCESO */}
                    {pendingOrders.length > 0 && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between px-2">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600">
                                        <Clock size={20} />
                                    </div>
                                    <h4 className="text-xl font-black text-foreground tracking-tight uppercase">
                                        Próximas Entregas y Pagos
                                    </h4>
                                </div>
                                <Badge variant="secondary" className="bg-amber-100 text-amber-700 border-amber-200">
                                    {pendingOrders.length} {pendingOrders.length === 1 ? 'Pedido' : 'Pedidos'}
                                </Badge>
                            </div>

                            <div className="space-y-4">
                                {pendingOrders.map((order) => (
                                    <OrderCard
                                        key={order.id}
                                        order={order}
                                        router={router}
                                        onView={setSelectedOrder}
                                        onUpload={setUploadOrder}
                                        onDeleteProof={handleDeleteProof}
                                        isDownloading={isDownloading}
                                        onDownload={handleDownload}
                                        getStatusDetails={getStatusDetails}
                                        getDeliveryColor={getDeliveryColor}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* SECCIÓN: HISTORIAL DE COMPRAS */}
                    {finishedOrders.length > 0 && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between px-2 pt-4 border-t-2 border-primary/5">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                        <History size={20} />
                                    </div>
                                    <h4 className="text-xl font-black text-foreground tracking-tight uppercase opacity-70">
                                        Historial de Compras
                                    </h4>
                                </div>
                                <Badge variant="outline" className="text-muted-foreground font-bold">
                                    {finishedOrders.length}
                                </Badge>
                            </div>

                            <div className="space-y-4 opacity-80 hover:opacity-100 transition-opacity">
                                {finishedOrders.map((order) => (
                                    <OrderCard
                                        key={order.id}
                                        order={order}
                                        router={router}
                                        onView={setSelectedOrder}
                                        onUpload={setUploadOrder}
                                        onDeleteProof={handleDeleteProof}
                                        isDownloading={isDownloading}
                                        onDownload={handleDownload}
                                        getStatusDetails={getStatusDetails}
                                        getDeliveryColor={getDeliveryColor}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            <Dialog
                open={!!selectedOrder}
                onOpenChange={() => setSelectedOrder(null)}
            >
                <DialogContent className="max-w-2xl rounded-[3rem] border-4 border-primary/20 bg-card/95 backdrop-blur-2xl p-0  max-h-[85vh] overflow-y-auto">
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
                            {/* Línea de tiempo visual */}
                            <OrderTracker order={selectedOrder} />

                            <div className="grid grid-cols-2 gap-8 py-6 border-y border-primary/5">
                                <div>
                                    <p className="text-[10px] text-primary/60 font-black tracking-[0.4em] mb-2">
                                        ESTADO PAGO
                                    </p>
                                    <Badge
                                        variant={getStatusDetails(selectedOrder).color}
                                        className={`rounded-full px-4 font-black ${getStatusDetails(selectedOrder).className || ''}`}
                                    >
                                        {getStatusDetails(selectedOrder).label}
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
                                        {selectedOrder.paymentType === 'QR' ? 'PAGO QR' : selectedOrder.paymentType?.replace("_", " ")}
                                    </p>
                                </div>
                            </div>

                            {/* QR de Pago */}
                            {selectedOrder.paymentType === 'QR' && selectedOrder.qrPaymentUrl && (
                                <div className="border-4 border-purple-500/20 bg-purple-50/30 dark:bg-purple-900/10 p-6 rounded-[2rem] space-y-4">
                                    <p className="text-[10px] text-purple-700/60 font-black tracking-[0.4em] flex items-center gap-2">
                                        <QrCode size={14} /> CÓDIGO QR DE PAGO
                                    </p>
                                    <div className="flex justify-center">
                                        <div className="bg-white p-4 rounded-2xl border-2 border-purple-200 shadow-sm inline-block">
                                            <img
                                                src={selectedOrder.qrPaymentUrl}
                                                alt="QR de Pago"
                                                className="w-[200px] h-[200px] object-contain rounded-lg"
                                            />
                                        </div>
                                    </div>
                                    <p className="text-xs text-purple-600 font-bold text-center">
                                        Escanea este QR con tu app bancaria para pagar
                                    </p>
                                </div>
                            )}

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
                                    className="flex-1 h-14 rounded-2xl font-black bg-primary text-white hover:bg-secondary transition-all gap-2 disabled:opacity-50"
                                    onClick={() => handleDownload(selectedOrder.id.toString())}
                                    disabled={isDownloading === selectedOrder.id.toString() || selectedOrder.paymentStatus !== 'PAID'}
                                >
                                    {isDownloading === selectedOrder.id.toString() ? (
                                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <Download size={18} />
                                            {selectedOrder.paymentStatus === 'PAID' ? 'DESCARGAR PDF' : 'PAGO PENDIENTE'}
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* DIÁLOGO: SUBIR COMPROBANTE */}
            <Dialog open={!!uploadOrder} onOpenChange={() => { setUploadOrder(null); setSelectedFile(null); }}>
                <DialogContent className="max-w-md rounded-[2.5rem] border-4 border-primary/20 bg-card/95 backdrop-blur-2xl p-8">
                    <DialogHeader className="mb-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="h-10 w-10 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600">
                                <Upload size={20} />
                            </div>
                            <DialogTitle className="text-xl font-black tracking-tighter uppercase">
                                Informar Pago
                            </DialogTitle>
                        </div>
                        <p className="text-xs font-bold text-muted-foreground tracking-widest uppercase">
                            Orden #{uploadOrder?.id} • {uploadOrder?.paymentType}
                        </p>
                    </DialogHeader>

                    <div className="space-y-6">
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="aspect-video rounded-[2rem] border-4 border-dashed border-primary/20 bg-primary/5 flex flex-col items-center justify-center cursor-pointer hover:bg-primary/10 transition-all group overflow-hidden relative"
                        >
                            {selectedFile ? (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-card/40 backdrop-blur-sm p-4 text-center">
                                    <CheckCircle2 className="h-12 w-12 text-green-500 mb-2" />
                                    <p className="font-black text-sm text-primary line-clamp-1">{selectedFile.name}</p>
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase mt-1">
                                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                    </p>
                                </div>
                            ) : uploadOrder?.paymentProofUrl ? (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-card/40 backdrop-blur-sm p-4 text-center">
                                    <div className="relative group/img">
                                        <img
                                            src={uploadOrder.paymentProofUrl}
                                            alt="Comprobante actual"
                                            className="h-24 w-24 object-cover rounded-2xl border-4 border-primary/20 mb-2"
                                        />
                                        <div className="absolute inset-0 bg-primary/20 rounded-2xl flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity">
                                            <Eye className="text-white" size={24} />
                                        </div>
                                    </div>
                                    <p className="font-black text-sm text-primary">Comprobante Actual</p>
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase mt-1">Haz clic para reemplazar</p>
                                </div>
                            ) : (
                                <>
                                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform mb-4">
                                        <Upload size={32} />
                                    </div>
                                    <p className="font-black text-primary tracking-tight">Seleccionar Comprobante</p>
                                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">JPG, PNG o PDF (Máx 5MB)</p>
                                </>
                            )}
                            <input
                                type="file"
                                className="hidden"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept="image/*,.pdf"
                            />
                        </div>

                        <div className="flex gap-3 pt-2">
                            <Button
                                variant="ghost"
                                className="flex-1 h-12 rounded-2xl font-black uppercase text-xs"
                                onClick={() => { setUploadOrder(null); setSelectedFile(null); }}
                            >
                                Cancelar
                            </Button>
                            <Button
                                disabled={!selectedFile || isUploading}
                                className="flex-[2] h-12 rounded-2xl font-black bg-primary text-white hover:bg-secondary transition-all gap-2"
                                onClick={handleUploadProof}
                            >
                                {isUploading ? (
                                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <CheckCircle2 size={18} />
                                        CONFIRMAR ENVÍO
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function OrderCard({
    order,
    onView,
    onUpload,
    onDeleteProof,
    isDownloading,
    onDownload,
    getStatusDetails,
    getDeliveryColor,
    router
}: any) {
    return (
        <Card
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
                <div className="flex max-sm:flex-col items-center gap-2">
                    <Badge
                        variant={getStatusDetails(order).color}
                        className={`rounded-full px-4 py-1 font-black text-[10px] tracking-widest uppercase ${getStatusDetails(order).className || ''}`}
                    >
                        {getStatusDetails(order).label}
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

            <OrderTracker order={order} />

            <div className="flex max-sm:flex-col items-center justify-between max-sm:gap-4">
                <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">
                        {order.items?.length || 0}{" "}
                        {order.items?.length === 1 ? "ARTÍCULO" : "ARTÍCULOS"}
                    </p>
                    <p className="text-2xl font-black text-foreground tracking-tighter">
                        {formatPrice(order.total, order.currencyCode)}
                    </p>
                </div>

                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        className="h-12 w-12 rounded-2xl border-2 border-primary/40 hover:bg-primary/10 hover:border-primary transition-all p-0"
                        onClick={() => onView(order)}
                        title={profile.orders.viewDetailsButton}
                    >
                        <Eye className="h-5 w-5 text-primary" />
                    </Button>

                    {order.paymentStatus === 'PENDING' && (order.paymentType === 'MERCADO_PAGO' || order.paymentType === 'TRANSFER' || order.paymentType === 'QR') && (
                        <div className="flex gap-2">
                            {order.paymentType === 'QR' && (
                                <Button
                                    variant="outline"
                                    className="h-12 w-12 rounded-2xl border-2 border-purple-500/40 hover:bg-purple-50 hover:border-purple-500 transition-all p-0"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        router.push(`/checkout/pending?saleId=${order.id}`);
                                    }}
                                    title="Ver QR de Pago"
                                >
                                    <QrCode className="h-5 w-5 text-purple-600" />
                                </Button>
                            )}

                            {(order.paymentType === 'MERCADO_PAGO' || order.paymentType === 'TRANSFER') && (
                                <>
                                    <Button
                                        variant="outline"
                                        className={`h-12 w-12 rounded-2xl border-2 transition-all p-0 ${order.paymentProofUrl ? 'border-green-500/40 hover:bg-green-50' : 'border-amber-500/40 hover:bg-amber-50'}`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onUpload(order);
                                        }}
                                        title={order.paymentProofUrl ? "Ver/Cambiar comprobante" : "Informar Pago"}
                                    >
                                        {order.paymentProofUrl ? (
                                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                                        ) : (
                                            <Upload className="h-5 w-5 text-amber-600" />
                                        )}
                                    </Button>

                                    {order.paymentProofUrl && (
                                        <Button
                                            variant="outline"
                                            className="h-12 w-12 rounded-2xl border-2 border-red-500/40 hover:bg-red-50 hover:border-red-500 transition-all p-0"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDeleteProof(order.id);
                                            }}
                                            title="Eliminar comprobante"
                                        >
                                            <XCircle className="h-5 w-5 text-red-600" />
                                        </Button>
                                    )}
                                </>
                            )}
                        </div>
                    )}

                    <Button
                        variant="outline"
                        className="h-12 w-12 rounded-2xl border-2 border-primary/40 hover:bg-primary/10 hover:border-primary transition-all p-0 disabled:opacity-50"
                        onClick={() => onDownload(order.id.toString())}
                        disabled={isDownloading === order.id.toString() || order.paymentStatus !== 'PAID'}
                        title={order.paymentStatus !== 'PAID' ? "Disponible solo al confirmar pago" : profile.orders.downloadButton}
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
    );
}
function OrderTracker({ order }: { order: any }) {
    const steps = [
        { id: 'PENDING', label: 'Orden Recibida', icon: ReceiptText },
        { id: 'PAID', label: 'Pago Confirmado', icon: CheckCircle2 },
        { id: 'SHIPPED', label: 'En Camino', icon: Package },
        { id: 'DELIVERED', label: 'Entregado', icon: CheckCircle2 },
    ];

    const currentStatus = order.paymentStatus === 'PAID'
        ? (order.deliveryStatus === 'DELIVERED' ? 'DELIVERED' : (order.deliveryStatus === 'SHIPPED' ? 'SHIPPED' : 'PAID'))
        : 'PENDING';

    const currentIndex = steps.findIndex(s => s.id === currentStatus);

    return (
        <div className="w-full py-6">
            <div className="relative flex justify-between">
                {/* Línea de fondo */}
                <div className="absolute top-5 left-0 w-full h-1 bg-primary/10 rounded-full" />
                {/* Línea de progreso */}
                <div
                    className="absolute top-5 left-0 h-1 bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
                />

                {steps.map((step, idx) => {
                    const isCompleted = idx <= currentIndex;
                    const isCurrent = idx === currentIndex;
                    const Icon = step.icon;

                    return (
                        <div key={step.id} className="relative flex flex-col items-center group">
                            <div
                                className={`h-11 w-11 rounded-2xl flex items-center justify-center transition-all duration-300 z-10 border-4 ${isCompleted
                                        ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-110'
                                        : 'bg-card text-muted-foreground border-primary/10'
                                    } ${isCurrent ? 'ring-4 ring-primary/20' : ''}`}
                            >
                                <Icon size={18} />
                            </div>
                            <p className={`mt-3 text-[10px] font-black uppercase tracking-tighter text-center max-w-[80px] leading-tight ${isCompleted ? 'text-primary' : 'text-muted-foreground opacity-50'
                                }`}>
                                {step.label}
                            </p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
