"use client";

import { useEffect, useState } from "react";
import { initMercadoPago, Payment } from "@mercadopago/sdk-react";
import { Loader2 } from "lucide-react";

interface MercadoPagoBrickProps {
    amount: number;
    onSubmit: (formData: any) => Promise<void>;
    onError?: (error: any) => void;
    onReady?: () => void;
    disabled?: boolean;
}

export default function MercadoPagoBrick({ amount, onSubmit, onError, onReady, disabled }: MercadoPagoBrickProps) {
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        const publicKey = process.env.NEXT_PUBLIC_MP_PUBLIC_KEY;
        if (publicKey) {
            initMercadoPago(publicKey, { locale: "es-AR" });
            setIsInitialized(true);
        } else {
            console.error("No se encontró la public key de Mercado Pago (NEXT_PUBLIC_MP_PUBLIC_KEY)");
        }
    }, []);

    if (!isInitialized) {
        return (
            <div className="flex flex-col items-center justify-center p-8 space-y-4">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-sm text-gray-500">Iniciando pasarela de pago segura...</p>
            </div>
        );
    }

    return (
        <div className="w-full relative min-h-[400px]">
            {disabled && (
                <div className="absolute inset-0 z-50 bg-white/60 backdrop-blur-[1px] flex flex-col items-center justify-center rounded-2xl transition-all duration-300 animate-in fade-in">
                    <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
                    <p className="text-xs font-bold text-primary uppercase tracking-widest">Cargando . . .</p>
                </div>
            )}
            <form className="w-full h-full" autoComplete="off" onSubmit={(e) => e.preventDefault()}>
                <Payment
                    initialization={{
                        amount: Math.max(1, amount),
                    }}
                    customization={{
                        visual: {
                            style: {
                                theme: "default" as any,
                            },
                        },
                        paymentMethods: {
                            creditCard: "all" as any,
                            debitCard: "all" as any,
                            ticket: "all" as any,
                            bankTransfer: "all" as any,
                            atm: "all" as any,
                            maxInstallments: 12,
                        },
                    }}
                    onSubmit={async ({ formData }) => {
                        if (onSubmit) {
                            return await onSubmit(formData);
                        }
                    }}
                    onError={(error) => {
                        console.error("Error en Brick MP:", error);
                        if (onError) onError(error);
                    }}
                    onReady={onReady}
                />
            </form>
        </div>
    );
}
