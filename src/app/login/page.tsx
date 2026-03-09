"use client";

import { auth } from "@/../content/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

const loginSchema = z.object({
  email: z.string().email(auth.validation.emailInvalid),
  password: z.string().min(1, auth.validation.passwordRequired),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPendingVerification, setIsPendingVerification] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect");
  const { login, loginWithGoogle, verify, resendCode, user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && user) {
if(redirectUrl?.includes("cart")){
  window.location.href = redirectUrl;
}else{

      router.replace(redirectUrl || "/profile");
}
    }
  }, [isLoading, user, router, redirectUrl]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });


  if (isLoading || user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

    const onSubmit = async (data: LoginForm) => {
    setIsSubmitting(true);
    try {
      await login(data.email, data.password);
      toast.success(auth.login.successMessage);
      router.push(redirectUrl || "/");
    } catch (error: any) {
      if (error?.code === 'EMAIL_NOT_VERIFIED') {
        setVerificationEmail(data.email);
        setIsPendingVerification(true);
      }
      console.debug("Login failed handled by global interceptor");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (verificationCode.length !== 6) {
      toast.error("El código debe tener 6 dígitos");
      return;
    }

    setIsSubmitting(true);
    try {
      await verify(verificationEmail, verificationCode);
    
      router.push(redirectUrl || "/profile");
    } catch (error) {
      console.debug("Verification failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isPendingVerification) {
    return (
      <main className="min-h-screen flex items-center justify-center p-8 bg-background relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10 -z-10" />
        <div className="w-full max-w-md space-y-8 bg-card p-10 rounded-2xl border-2 border-border shadow-2xl relative z-10">
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Verifica tu cuenta</h1>
            <p className="text-muted-foreground mt-4">
              Tu cuenta aún no está verificada. Ingresa el código enviado a <span className="font-semibold text-primary">{verificationEmail}</span>
            </p>
          </div>

          <form onSubmit={onVerify} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="code" className="font-semibold ml-1">Código de Verificación</Label>
              <Input
                id="code"
                type="text"
                maxLength={6}
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))}
                placeholder="000000"
                className="rounded-xl h-16 text-center text-3xl tracking-[1rem] font-bold border-2 bg-muted/20 focus:bg-background transition-all border-border focus:border-primary"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full rounded-full h-14 font-bold text-lg shadow-xl shadow-primary/25 hover:shadow-primary/40 transition-all bg-gradient-to-r from-primary to-secondary hover:scale-[1.02]"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Verificando..." : "Verificar Cuenta"}
            </Button>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                ¿No recibiste el código?{" "}
                <button
                  type="button"
                  onClick={() => resendCode(verificationEmail)}
                  className="text-primary hover:underline font-semibold"
                >
                  Reenviar código
                </button>
              </p>
            </div>
          </form>

          <div className="text-center">
            <button 
              type="button"
              onClick={() => setIsPendingVerification(false)}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              ← Volver al inicio de sesión
            </button>
          </div>
        </div>
      </main>
    );
  }

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (error) {
      toast.error("Error en inicio de sesión con Google");
    }
  };

  return (
    <main className="min-h-screen  md:h-auto grid lg:grid-cols-2  max-md:pb-20 max-md:pt-0 max-md:bg-background/80 max-sm:overflow-hidden ">
      {/* Lado decorativo */}
      <div className="hidden lg:flex flex-col justify-between relative overflow-hidden p-16 text-white  ">
        <div className="absolute inset-0 bg-gradient-to-t from-primary via-indigo-600 to-secondary/80 opacity-90" />
        {" "}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-secondary/30 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/30 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 animate-pulse delay-1000" />
        <div className="flex   flex-col relative z-10 max-w-lg mx-auto space-y-6 h-full  pt-40">
          <h2 className="text-5xl font-bold leading-tight">
            Una experiencia digital{" "}
            <span className="bg-gradient-to-r from-purple-200 to-pink-200 bg-clip-text text-transparent">
              Segura y Confiable.
            </span>
          </h2>

          <p className="text-lg text-white/80 leading-relaxed font-light">
            Te ofrecemos una experiencia rápida, segura y transparente.
            Protegemos tus datos, garantizamos tus transacciones y te
            acompañamos en cada paso para que operes con total confianza.
          </p>
        </div>
      </div>

      {/* Form side */}
      <div className="flex items-center justify-center  p-8 py-40 max-md:py-20  bg-background max-md:bg-background/80   relative ">
        {/* Decoración de fondo para móviles */}
        <div className="absolute inset-0 lg:hidden -z-10 ">
          <div className="absolute top-[-20%] right-[-20%] w-[80%] h-[80%] bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-[-20%] left-[-20%] w-[80%] h-[80%] bg-secondary/10 rounded-full blur-3xl" />
        </div>

        <div className="w-full max-w-md space-y-8 ">
          <div className="text-center lg:text-left">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              {auth.login.title}
            </h1>
            <p className="text-muted-foreground mt-2">{auth.login.subtitle}</p>
          </div>

          <div className="space-y-6">
            <Button
              variant="outline"
              className="w-full rounded-full h-14 hover:bg-muted/50 border-2 border-primary/60 hover:border-primary/20 bg-background transition-all font-medium text-base relative overflow-hidden group"
              onClick={handleGoogleLogin}
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
                {auth.login.googleButton}
              </span>
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center ">
                <span className="w-full border-t " />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="px-2 text-muted-foreground">
                  O continua con tu correo
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="font-semibold ml-1">
                  {auth.login.emailLabel}
                </Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  placeholder={auth.login.emailPlaceholder}
                  className={`rounded-xl h-14 border-2 bg-muted/20 focus:bg-background transition-all ${errors.email ? "border-destructive" : "border-border hover:border-primary/40 focus:border-primary"}`}
                />
                {errors.email && (
                  <p className="text-sm text-destructive ml-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password" className="font-semibold ml-1">
                    {auth.login.passwordLabel}
                  </Label>
                  <Link
                    href="/reset-password"
                    className="text-sm text-primary hover:underline font-medium"
                  >
                    {auth.login.forgotPassword}
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  {...register("password")}
                  placeholder={auth.login.passwordPlaceholder}
                  className={`rounded-xl h-14 border-2 bg-muted/20 focus:bg-background transition-all ${errors.password ? "border-destructive" : "border-border hover:border-primary/40 focus:border-primary"}`}
                />
                {errors.password && (
                  <p className="text-sm text-destructive ml-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full rounded-full h-14 font-bold text-lg shadow-xl shadow-primary/25 hover:shadow-primary/40 transition-all bg-gradient-to-r from-primary to-secondary hover:scale-[1.02]"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? auth.login.submittingButton
                  : auth.login.submitButton}
              </Button>
            </form>

            <div className="text-center text-sm">
              {auth.login.noAccount}{" "}
              <Link
                href="/register"
                className="text-primary hover:underline font-semibold"
              >
                {auth.login.signUpLink}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
