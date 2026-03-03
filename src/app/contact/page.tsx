"use client";

import { contact } from "@/../content/contact";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Branch, branchService } from "@/services/branch";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { Clock, Mail, MapPin, Navigation, Phone } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().optional(),
  subject: z.string().min(3, "Subject must be at least 3 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactForm = z.infer<typeof contactSchema>;

function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nearestBranchId, setNearestBranchId] = useState<number | null>(null);

  const { data: branches, isLoading } = useQuery({
    queryKey: ["branches"],
    queryFn: branchService.getAll,
    staleTime: 1000 * 60 * 60,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactForm) => {
    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success(contact.form.successMessage);
      reset();
    } catch (error) {
      toast.error(contact.form.errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const findNearestBranch = () => {
    if (!navigator.geolocation) {
      toast.error("Tu navegador no soporta geolocalización");
      return;
    }

    if (!branches || branches.length === 0) {
      toast.error("No hay información de sucursales disponible.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        const validBranches = branches.filter(
          (b) => b.latitude != null && b.longitude != null,
        );

        if (validBranches.length === 0) {
          toast.error("Las sucursales no tienen coordenadas configuradas.");
          return;
        }

        let nearest = validBranches[0];
        let minDistance = haversineDistance(
          latitude,
          longitude,
          Number(nearest.latitude),
          Number(nearest.longitude),
        );

        validBranches.forEach((branch) => {
          const distance = haversineDistance(
            latitude,
            longitude,
            Number(branch.latitude),
            Number(branch.longitude),
          );
          if (distance < minDistance) {
            minDistance = distance;
            nearest = branch;
          }
        });

        setNearestBranchId(nearest.id);
        toast.success(
          `Sucursal más cercana: ${nearest.name} (${minDistance.toFixed(1)} km)`,
        );
      },
      (error) => {
        toast.error("No se pudo obtener tu ubicación.");
      },
    );
  };

  const renderBranchCard = (branch: Branch) => {
    let hoursDisplay = "Consultar horarios";
    try {
      if (typeof branch.operatingHours === "string") {
        hoursDisplay = branch.operatingHours;
      } else if (
        typeof branch.operatingHours === "object" &&
        branch.operatingHours !== null
      ) {
        const entries = Object.entries(branch.operatingHours);
        if (entries.length > 0) {
          const [day, time] = entries[0];
          // @ts-ignore
          hoursDisplay = `${day}: ${time?.open || time} - ${time?.close || ""}`;
          if (entries.length > 1) hoursDisplay += " ...";
        }
      }
    } catch (e) {}

    return (
      <div
        key={branch.id}
        className={`p-6 rounded-[1.5rem] bg-white border-[3px] transition-all group ${nearestBranchId === branch.id ? "border-purple-600 shadow-lg scale-105" : "border-gray-300 hover:border-purple-300"}`}
      >
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-bold text-xl text-gray-900">{branch.name}</h3>
          {nearestBranchId === branch.id && (
            <Badge className="bg-purple-600 hover:bg-purple-700">Cerca</Badge>
          )}
        </div>
        <div className="space-y-3 text-sm text-gray-600 font-medium">
          <div className="flex gap-3 items-start">
            <MapPin className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
            <div>
              <p>{branch.address}</p>
              {(branch.city || branch.state) && (
                <p className="text-gray-500 text-xs mt-1 font-semibold">
                  {[branch.city, branch.state].filter(Boolean).join(", ")}
                </p>
              )}
            </div>
          </div>

          <p className="flex gap-3 items-center">
            <Phone className="w-5 h-5 text-purple-600 shrink-0" />{" "}
            {branch.phone}
          </p>

          {branch.email && (
            <p className="flex gap-3 items-center break-all">
              <Mail className="w-5 h-5 text-purple-600 shrink-0" />{" "}
              {branch.email}
            </p>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full mt-6 rounded-full border-2 border-purple-300 hover:border-purple-600 hover:bg-secondary/90 hover:text-white text-purple-700 font-bold transition-all "
          onClick={() => {
            if (branch.latitude && branch.longitude) {
              window.open(
                `https://www.google.com/maps/search/?api=1&query=${branch.latitude},${branch.longitude}`,
                "_blank",
              );
            } else {
              toast.error("Coordenadas no disponibles para esta sucursal");
            }
          }}
        >
          <Navigation className="w-4 h-4 mr-2" />
          Como llegar
        </Button>
      </div>
    );
  };

  const displayedBranches = branches ? branches.slice(0, 2) : [];
  const hasMoreBranches = branches && branches.length > 2;

  return (
    <main className="min-h-screen bg-white pb-40 pt-20 max-md:pt-0">
      {/* Hero Section */}
      <section className="relative pt-32 pb-48 flex items-center justify-center overflow-hidden bg-gradient-to-r from-secondary/60 to-primary/60 ">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px]  rounded-full blur-[100px] -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full blur-[100px] translate-y-1/2"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10 text-center">
          <h1 className="text-6xl md:text-7xl max-md:text-5xl font-black mb-6 tracking-tighter text-white drop-shadow-2xl">
            {contact.hero.title}
          </h1>
          <p className="text-xl md:text-2xl text-purple-100 max-w-2xl mx-auto leading-relaxed font-bold drop-shadow-md">
            {contact.hero.subtitle}
          </p>
        </div>
      </section>

      {/* Separador  */}
      <div className="absolute left-0 w-full overflow-hidden leading-[0] z-20 ">
        <svg
          data-name="Layer 1"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          className="relative block w-[calc(100%+1.3px)] h-[100px]"
        >
          <defs>
            <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#a855f7" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#b34d8e" stopOpacity="0.6" />
            </linearGradient>
          </defs>
          <path
            d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
            fill="url(#waveGradient)"
          ></path>
        </svg>
      </div>

      <div className="max-w-[95%]  max-md:max-w-full pt-20  mx-auto max-sm:px-2 max-md:px-20 max-lg:px-16 px-4 -mt-20 relative z-20">
        <div className="grid lg:grid-cols-12 gap-10 ">
          {/* Información de contacto y sucursales */}
          <div className="lg:col-span-4 space-y-8 ">
            <Card className="p-8 max-sm:px-4 max-md:px-10  max-lg:px-16 rounded-[2.5rem] border-[3px] border-secondary bg-white shadow-[0_20px_60px_-15px_rgba(168,85,247,0.4)] h-full relative overflow-hidden ">
              <div className="absolute top-0 right-0 w-64 h-64 bg-purple-50 rounded-bl-[100px] -z-10 -mr-10 -mt-10"></div>

              <div className="mb-10 relative z-10">
                <h2 className="text-4xl font-black mb-4 text-gray-900">
                  Información
                </h2>
                <p className="text-gray-600 font-medium text-lg">
                  Encuentra nuestras sucursales o contáctanos directamente.
                </p>
              </div>

              <div className="space-y-6 relative z-10">
                {isLoading ? (
                  <div className="space-y-6">
                    {[1, 2].map((i) => (
                      <div
                        key={i}
                        className="p-6 rounded-[1.5rem] bg-white border-[3px] border-gray-200"
                      >
                        <Skeleton className="h-6 w-3/4 mb-4" />
                        <div className="space-y-3">
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-2/3" />
                          <Skeleton className="h-4 w-1/2" />
                        </div>
                        <Skeleton className="h-10 w-full mt-6 rounded-full" />
                      </div>
                    ))}
                  </div>
                ) : branches && branches.length > 0 ? (
                  <>
                    {displayedBranches.map(renderBranchCard)}

                    {hasMoreBranches && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            className="w-full text-purple-600 hover:text-purple-700 hover:bg-purple-50 font-bold transition-all"
                          >
                            Ver más sucursales ({branches.length - 2} más)
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle className="text-2xl font-bold mb-4">
                              Todas nuestras sucursales
                            </DialogTitle>
                          </DialogHeader>
                          <div className="grid gap-6">
                            {branches.map(renderBranchCard)}
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </>
                ) : (
                  contact.branches.slice(0, 2).map((branch) => (
                    <div
                      key={branch.id}
                      className="p-6 rounded-[1.5rem] bg-white border-[3px] border-gray-300 opacity-60"
                    >
                      <h3 className="font-bold text-xl text-gray-900">
                        {branch.name}
                      </h3>
                      <p className="text-gray-600">{branch.address}</p>
                      <p className="text-xs text-red-400 mt-2">
                        Sin conexión al servidor (Mostrando Demo)
                      </p>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-10 pt-8 border-t-2 border-gray-100 relative z-10 max-md:w-[90%] max-md:mx-auto ">
                <Button
                  onClick={findNearestBranch}
                  className="w-full rounded-full h-14 text-lg max-md:text-[0.8rem]  font-bold bg-gray-900 text-white hover:bg-black shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all"
                >
                  <MapPin className="w-5 h-5 mr-3 max-md:mr-1" />
                  {contact.map.findNearestButton}
                </Button>
              </div>
            </Card>
          </div>

          {/*  Contact Form */}
          <div className="lg:col-span-8">
            <Card className="p-8 max-md:px-4 md:p-12 rounded-[2.5rem] border-[3px] border-primary/60 bg-white shadow-[0_20px_60px_-15px_rgba(99,102,241,0.4)] h-full relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-50/50 rounded-bl-[150px] -z-10 -mr-20 -mt-20"></div>

              <div className="max-w-4xl mx-auto relative z-10">
                <h2 className="text-4xl font-black mb-4 text-gray-900 max-md:text-center">
                  {contact.form.title}
                </h2>
                <div className="h-2 w-32 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full mb-12"></div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <Label
                        htmlFor="name"
                        className="text-xl font-bold ml-1 text-gray-800"
                      >
                        Nombre Completo
                      </Label>
                      <Input
                        id="name"
                        {...register("name")}
                        placeholder="Tu nombre"
                        className={`h-12 rounded-[1.2rem] border-2 bg-gray-50/50 text-xl px-6 font-medium placeholder:text-gray-400 focus:bg-white transition-all ${errors.name ? "border-red-500 focus:ring-red-200" : "border-gray-400 focus:border-secondary focus:ring-4 focus:ring-purple-100"}`}
                      />
                      {errors.name && (
                        <p className="text-red-600 font-bold text-sm ml-2">
                          {errors.name.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-3">
                      <Label
                        htmlFor="email"
                        className="text-xl font-bold ml-1 text-gray-800"
                      >
                        Email
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        {...register("email")}
                        placeholder="tucorreo@ejemplo.com"
                        className={`h-12 rounded-[1.2rem] border-2 bg-gray-50/50 text-xl px-6 font-medium placeholder:text-gray-400 focus:bg-white transition-all ${errors.email ? "border-red-500 focus:ring-red-200" : "border-gray-400 focus:border-secondary focus:ring-4 focus:ring-purple-100"}`}
                      />
                      {errors.email && (
                        <p className="text-red-600 font-bold text-sm ml-2">
                          {errors.email.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <Label
                        htmlFor="phone"
                        className="text-xl font-bold ml-1 text-gray-800"
                      >
                        Teléfono (Opcional)
                      </Label>
                      <Input
                        id="phone"
                        {...register("phone")}
                        placeholder="+54 ..."
                        className="h-12 rounded-[1.2rem] border-2 border-gray-400 bg-gray-50/50 text-xl px-6 font-medium placeholder:text-gray-400 focus:border-secondary focus:bg-white focus:ring-4 focus:ring-purple-100 transition-all"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label
                        htmlFor="subject"
                        className="text-xl font-bold ml-1 text-gray-800"
                      >
                        Asunto
                      </Label>
                      <Input
                        id="subject"
                        {...register("subject")}
                        placeholder="Motivo de consulta"
                        className={`h-12 rounded-[1.2rem] border-2 bg-gray-50/50 text-xl px-6 font-medium placeholder:text-gray-400 focus:bg-white transition-all ${errors.subject ? "border-red-500 focus:ring-red-200" : "border-gray-400 focus:border-secondary focus:ring-4 focus:ring-purple-100"}`}
                      />
                      {errors.subject && (
                        <p className="text-red-600 font-bold text-sm ml-2">
                          {errors.subject.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label
                      htmlFor="message"
                      className="text-xl font-bold ml-1 text-gray-800"
                    >
                      Mensaje
                    </Label>
                    <textarea
                      id="message"
                      {...register("message")}
                      rows={6}
                      className={`w-full rounded-[1.5rem] border-2 bg-gray-50/50 p-6 text-xl font-medium outline-none transition-all placeholder:text-gray-400 focus:bg-white ${
                        errors.message
                          ? "border-red-500 focus:ring-red-200"
                          : "border-gray-400 focus:border-secondary focus:ring-4 focus:ring-purple-100"
                      }`}
                      placeholder="Escribe tu mensaje aquí..."
                    />
                    {errors.message && (
                      <p className="text-red-600 font-bold text-sm ml-2">
                        {errors.message.message}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-20 text-2xl rounded-full bg-gradient-to-r from-secondary/70 to-primary/70 hover:from-purple-700 hover:to-indigo-700 text-white shadow-xl hover:shadow-[0_20px_40px_-10px_rgba(124,58,237,0.5)] hover:-translate-y-1 transition-all font-black"
                    disabled={isSubmitting}
                  >
                    {isSubmitting
                      ? contact.form.submittingButton
                      : contact.form.submitButton}
                  </Button>
                </form>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
