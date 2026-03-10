"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { commentService, type Comment } from "@/services/comments";
import { useMutation, useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { motion } from "framer-motion";
import { MessageSquare, Quote, Send, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

export function Testimonials() {
  const { user } = useAuth();
  const { data: testimonials, refetch } = useQuery({
    queryKey: ["testimonials"],
    queryFn: () => commentService.getTestimonials(9),
  });

  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");

  const createCommentMutation = useMutation({
    mutationFn: async (data: { content: string; rating: number }) => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/comments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
          body: JSON.stringify({
            content: data.content,
            rating: data.rating,
            productId: null,
          }),
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error al enviar comentario");
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success("¡Testimonio enviado!", {
        description: "Tu comentario será revisado antes de publicarse",
      });
      setContent("");
      setRating(5);
      refetch();
    },
    onError: (error: Error) => {
      toast.error("Error al enviar testimonio", {
        description: error.message,
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("Debes iniciar sesión para dejar un testimonio", {
        action: {
          label: "Iniciar Sesión",
          onClick: () => (window.location.href = "/login"),
        },
      });
      return;
    }

    if (!content.trim()) {
      toast.error("Por favor escribe tu comentario");
      return;
    }

    createCommentMutation.mutate({ content, rating });
  };

  const hasTestimonials = testimonials && testimonials.length > 0;

  return (
    <section className="py-16 pb-40">
      <div className="container mx-auto px-4">
        {/* Cabecera */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">
            Opiniones de Nuestros Clientes
          </h2>
          <p className="text-gray-600 text-lg">
            Experiencias reales de personas que confían en nosotros
          </p>
        </div>

        {/* Cuadrícula de testimonios */}
        {hasTestimonials && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {testimonials?.slice(0, 9).map((testimonial, idx) => (
              <motion.div
                key={testimonial.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <TestimonialCard testimonial={testimonial} />
              </motion.div>
            ))}
          </div>
        )}

        {/* Formulario de comentario  */}
        <div className="max-w-3xl mx-auto mt-16">
          <div className="bg-gradient-to-br from-primary/5 to-primary/10 border-2 border-primary/20 rounded-2xl p-8 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  Comparte tu Experiencia
                </h3>
                <p className="text-sm text-gray-600">
                  Cuéntanos qué te pareció comprar con nosotros
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Calificación */}
              <div>
                <Label className="text-base font-semibold mb-3 block">
                  Calificación
                </Label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "fill-gray-200 text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Comentario */}
              <div>
                <Label htmlFor="content" className="text-base font-semibold">
                  Tu Comentario
                </Label>
                <Textarea
                  id="content"
                  placeholder="Cuéntanos sobre tu experiencia comprando en nuestra tienda..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="mt-2 border-2 border-gray-300 focus:border-primary min-h-[120px] resize-none"
                  required
                />
              </div>

              {/* Botón de envío */}
              <Button
                type="submit"
                size="lg"
                disabled={createCommentMutation.isPending}
                className="w-full h-12 text-base font-semibold gap-2"
              >
                <Send className="w-5 h-5" />
                {createCommentMutation.isPending
                  ? "Enviando..."
                  : "Enviar Testimonio"}
              </Button>

              {!user && (
                <p className="text-sm text-amber-600 text-center font-medium">
                    Debes{" "}
                  <Link
                    href="/login"
                    className="underline hover:text-amber-700"
                  >
                    iniciar sesión
                  </Link>{" "}
                  para dejar un testimonio
                </p>
              )}

              <p className="text-xs text-gray-500 text-center">
                Tu testimonio será revisado antes de publicarse
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

function TestimonialCard({ testimonial }: { testimonial: Comment }) {
  const userInitials = testimonial.user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="bg-white border-[3px] border-gray-300 p-6 rounded-2xl shadow-xl hover:shadow-2xl hover:border-primary/40 transition-all h-full flex flex-col">
      {/* Cabecera con Info del Usuario */}
      <div className="flex items-start gap-3 mb-4 pb-4 border-b-2 border-gray-200">
        <div className="flex-shrink-0">
          {testimonial.user.profileImage ? (
            <div className="w-12 h-12 rounded-full ring-[3px] ring-primary/30 overflow-hidden">
              <Image
                src={testimonial.user.profileImage}
                alt={testimonial.user.name}
                width={48}
                height={48}
                className="object-cover"
              />
            </div>
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 ring-[3px] ring-primary/40 flex items-center justify-center">
              <span className="text-sm font-bold text-primary">
                {userInitials}
              </span>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-base truncate text-gray-900">
            {testimonial.user.name}
          </p>
          <p className="text-xs text-gray-500">
            {formatDistanceToNow(new Date(testimonial.createdAt), {
              addSuffix: true,
              locale: es,
            })}
          </p>
        </div>
        <Quote className="h-6 w-6 text-primary/20 flex-shrink-0" />
      </div>

      {/* Calificación */}
      {testimonial.rating && (
        <div className="flex gap-1 mb-4">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`h-6 w-6 ${
                i < testimonial.rating!
                  ? "fill-yellow-400 text-yellow-400"
                  : "fill-gray-200 text-gray-200"
              }`}
            />
          ))}
        </div>
      )}

      {/* Contenido del Comentario */}
      <p className="text-sm text-gray-700 leading-relaxed flex-1">
        &quot;{testimonial.content}&quot;
      </p>
    </div>
  );
}
