"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { loadTrackers } from "@/lib/trackers";
import { useCookieConsent } from "@/store/cookies";
import { AnimatePresence, motion } from "framer-motion";
import { Cookie } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export function CookieBanner() {
  const {
    analytics,
    marketing,
    ads,
    hasConsented,
    setConsent,
    acceptAll,
    rejectAll,
    savePreferences,
  } = useCookieConsent();

  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    setShowBanner(!hasConsented);
  }, [hasConsented]);

  useEffect(() => {
    // Cargar trackers cuando cambia el consentimiento
    if (hasConsented) {
      loadTrackers({ analytics, marketing, ads });
    }
  }, [hasConsented, analytics, marketing, ads]);

  const handleAcceptAll = () => {
    acceptAll();
    setShowBanner(false);
  };

  const handleRejectAll = () => {
    rejectAll();
    setShowBanner(false);
  };

  const handleSavePreferences = () => {
    savePreferences();
    setShowBanner(false);
  };

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-0 max-sm:bottom-20  left-0 right-0 z-50 p-4"
        >
          <Card className="container mx-auto max-w-4xl p-6 shadow-2xl border-2">
            <div className="flex items-start gap-4">
              <Cookie className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2">
                  Preferencias de Cookies
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Utilizamos cookies para mejorar tu experiencia de navegación,
                  ofrecer contenido personalizado y analizar nuestro tráfico. Al
                  hacer clic en &quot;Aceptar Todo&quot;, aceptas nuestro uso de
                  cookies.{" "}
                  <Link
                    href="/legal/privacy"
                    className="text-primary hover:underline"
                  >
                    Aprender más
                  </Link>
                </p>

                {showDetails && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    className="space-y-4 mb-4"
                  >
                    <Separator />

                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          id="necessary"
                          checked={true}
                          disabled
                          className="mt-1"
                        />
                        <div>
                          <Label htmlFor="necessary" className="font-medium">
                            Cookies Necesarias (Siempre Activas)
                          </Label>
                          <p className="text-xs text-muted-foreground mt-1">
                            Esenciales para que el sitio web funcione
                            correctamente. No se pueden desactivar.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Checkbox
                          id="analytics"
                          checked={analytics}
                          onCheckedChange={(checked) =>
                            setConsent("analytics", checked as boolean)
                          }
                          className="mt-1"
                        />
                        <div>
                          <Label
                            htmlFor="analytics"
                            className="font-medium cursor-pointer"
                          >
                            Cookies de Análisis
                          </Label>
                          <p className="text-xs text-muted-foreground mt-1">
                            Nos ayudan a entender cómo los visitantes
                            interactúan con nuestro sitio web.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Checkbox
                          id="marketing"
                          checked={marketing}
                          onCheckedChange={(checked) =>
                            setConsent("marketing", checked as boolean)
                          }
                          className="mt-1"
                        />
                        <div>
                          <Label
                            htmlFor="marketing"
                            className="font-medium cursor-pointer"
                          >
                            Cookies de Marketing
                          </Label>
                          <p className="text-xs text-muted-foreground mt-1">
                            Utilizadas para ofrecer anuncios personalizados
                            relevantes para ti.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Checkbox
                          id="ads"
                          checked={ads}
                          onCheckedChange={(checked) =>
                            setConsent("ads", checked as boolean)
                          }
                          className="mt-1"
                        />
                        <div>
                          <Label
                            htmlFor="ads"
                            className="font-medium cursor-pointer"
                          >
                            Cookies de Publicidad
                          </Label>
                          <p className="text-xs text-muted-foreground mt-1">
                            Rastrean tu actividad para mostrar anuncios basados
                            en tus intereses.
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                <div className="flex flex-wrap gap-2">
                  <Button onClick={handleAcceptAll}>Aceptar Todo</Button>
                  <Button variant="outline" onClick={handleRejectAll}>
                    Rechazar Todo
                  </Button>
                  {showDetails ? (
                    <Button variant="secondary" onClick={handleSavePreferences}>
                      Guardar Preferencias
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      onClick={() => setShowDetails(true)}
                    >
                      Personalizar
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
