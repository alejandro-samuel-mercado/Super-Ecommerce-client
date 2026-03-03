"use client";

import { auth } from "@/../content/auth";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

const registerSchema = z
  .object({
    firstName: z.string().min(2, auth.validation.firstNameRequired),
    lastName: z.string().min(2, auth.validation.lastNameRequired),
    email: z.string().email(auth.validation.emailInvalid),
    password: z
      .string()
      .min(8, auth.validation.passwordMin)
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        auth.validation.passwordStrength,
      ),
    confirmPassword: z.string(),
    acceptTerms: z
      .boolean()
      .refine((val) => val === true, auth.validation.termsRequired),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: auth.errors.PASSWORDS_DONT_MATCH,
    path: ["confirmPassword"],
  });

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const {
    register: registerUser,
    loginWithGoogle,
    user,
    isLoading,
  } = useAuth();

  useEffect(() => {
    if (!isLoading && user) {
      router.replace("/profile");
    }
  }, [isLoading, user, router]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { acceptTerms: false },
  });

  const acceptTerms = watch("acceptTerms");


  if (isLoading || user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const onSubmit = async (data: RegisterForm) => {
    setIsSubmitting(true);
    try {
      await registerUser({
        name: `${data.firstName} ${data.lastName}`,
        email: data.email,
        password: data.password,
      });
      toast.success(auth.register.successMessage);
      router.push("/profile");
    } catch (error) {
      console.debug("Registration failed handled by global interceptor");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen grid lg:grid-cols-2 max-md:pb-20 max-md:pt-10 max-md:bg-gray-300/80 ">
      {/* Lado de búsqueda - Decorativo */}
      <div className="hidden lg:flex flex-col justify-between relative overflow-hidden p-16 text-white bg-black">
        {/* Gradiente de fondo */}
        <div className="absolute inset-0 bg-gradient-to-br from-pink-600 via-rose-600 to-orange-600 opacity-90" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />

        {/* Formas decorativas */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-500/30 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-pink-500/30 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 animate-pulse delay-1000" />

        <div className="relative z-10"></div>

        <div className="relative z-10 max-w-lg space-y-6">
          <h2 className="text-5xl font-bold leading-tight">
            Comienza Tu{" "}
            <span className="bg-gradient-to-r from-yellow-200 to-amber-200 bg-clip-text text-transparent">
              Viaje de Estilo
            </span>{" "}
            Hoy.
          </h2>
          <p className="text-lg text-white/80 leading-relaxed font-light">
            Crea una cuenta para rastrear órdenes, guardar artículos en tu lista
            de deseos y obtener recomendaciones personalizadas solo para ti.
          </p>
        </div>

        <div className="relative z-10 text-sm text-white/60 font-medium"></div>
      </div>

      {/* Formulario */}
      <div className="flex items-center justify-center  p-8 bg-background max-md:bg-gray-300/80   relative">
        {/* Decoración de fondo */}
        <div className="absolute inset-0 lg:hidden -z-10">
          <div className="absolute top-[-20%] right-[-20%] w-[80%] h-[80%] bg-pink-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-[-20%] left-[-20%] w-[80%] h-[80%] bg-orange-500/10 rounded-full blur-3xl" />
        </div>

        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              {auth.register.title}
            </h1>
            <p className="text-muted-foreground mt-2">
              {auth.register.subtitle}
            </p>
          </div>

          <div className="space-y-6">
            <Button
              variant="outline"
              className="w-full rounded-full h-14 hover:bg-muted/50 border-2 border-muted hover:border-primary/20 bg-background transition-all font-medium text-base relative overflow-hidden group"
              onClick={() => loginWithGoogle()}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <svg className="w-5 h-5 mr-3 relative z-10" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span className="relative z-10 text-foreground">
                {auth.register.googleButton}
              </span>
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="px-2 text-muted-foreground">
                  O regístrate con tu correo
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="font-semibold ml-1">
                    {auth.register.firstNameLabel}
                  </Label>
                  <Input
                    id="firstName"
                    {...register("firstName")}
                    placeholder={auth.register.firstNamePlaceholder}
                    className={`rounded-xl h-12 border-2 bg-muted/20 focus:bg-background transition-all ${errors.firstName ? "border-destructive" : "border-muted hover:border-primary/40 focus:border-primary"}`}
                  />
                  {errors.firstName && (
                    <p className="text-sm text-destructive ml-1">
                      {errors.firstName.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName" className="font-semibold ml-1">
                    {auth.register.lastNameLabel}
                  </Label>
                  <Input
                    id="lastName"
                    {...register("lastName")}
                    placeholder={auth.register.lastNamePlaceholder}
                    className={`rounded-xl h-12 border-2 bg-muted/20 focus:bg-background transition-all ${errors.lastName ? "border-destructive" : "border-muted hover:border-primary/40 focus:border-primary"}`}
                  />
                  {errors.lastName && (
                    <p className="text-sm text-destructive ml-1">
                      {errors.lastName.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="font-semibold ml-1">
                  {auth.register.emailLabel}
                </Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  placeholder={auth.register.emailPlaceholder}
                  className={`rounded-xl h-12 border-2 bg-muted/20 focus:bg-background transition-all ${errors.email ? "border-destructive" : "border-muted hover:border-primary/40 focus:border-primary"}`}
                />
                {errors.email && (
                  <p className="text-sm text-destructive ml-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="font-semibold ml-1">
                  {auth.register.passwordLabel}
                </Label>
                <Input
                  id="password"
                  type="password"
                  {...register("password")}
                  placeholder={auth.register.passwordPlaceholder}
                  className={`rounded-xl h-12 border-2 bg-muted/20 focus:bg-background transition-all ${errors.password ? "border-destructive" : "border-muted hover:border-primary/40 focus:border-primary"}`}
                />
                {errors.password && (
                  <p className="text-sm text-destructive ml-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="font-semibold ml-1">
                  {auth.register.confirmPasswordLabel}
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  {...register("confirmPassword")}
                  placeholder={auth.register.confirmPasswordPlaceholder}
                  className={`rounded-xl h-12 border-2 bg-muted/20 focus:bg-background transition-all ${errors.confirmPassword ? "border-destructive" : "border-muted hover:border-primary/40 focus:border-primary"}`}
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive ml-1">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-start gap-3 p-3 rounded-lg border border-transparent hover:bg-muted/50 transition-colors">
                  <Checkbox
                    id="acceptTerms"
                    checked={acceptTerms}
                    onCheckedChange={(checked) =>
                      setValue("acceptTerms", checked as boolean)
                    }
                    className="mt-1"
                  />
                  <label
                    htmlFor="acceptTerms"
                    className="text-sm leading-relaxed cursor-pointer select-none text-muted-foreground"
                  >
                    {auth.register.termsLabel}
                  </label>
                </div>
                {errors.acceptTerms && (
                  <p className="text-sm text-destructive ml-1">
                    {errors.acceptTerms.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full rounded-full h-14 font-bold text-lg shadow-xl shadow-primary/25 hover:shadow-primary/40 transition-all bg-gradient-to-r from-primary to-secondary hover:scale-[1.02] mt-2"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? auth.register.submittingButton
                  : auth.register.submitButton}
              </Button>
            </form>

            <div className="text-center text-sm">
              {auth.register.haveAccount}{" "}
              <Link
                href="/login"
                className="text-primary hover:underline font-semibold"
              >
                {auth.register.signInLink}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
