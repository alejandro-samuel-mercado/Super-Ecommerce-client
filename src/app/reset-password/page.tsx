"use client";

import { auth } from "@/../content/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authService } from "@/services/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

const emailSchema = z.object({
  email: z.string().email(auth.validation.emailInvalid),
});

const resetSchema = z.object({
  code: z.string().length(6, "Code must be 6 digits"),
  newPassword: z
    .string()
    .min(8, auth.validation.passwordMin)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, auth.validation.passwordStrength),
});

type EmailForm = z.infer<typeof emailSchema>;
type ResetForm = z.infer<typeof resetSchema>;

export default function ResetPasswordPage() {
  const [step, setStep] = useState<"email" | "reset">("email");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const emailForm = useForm<EmailForm>({ resolver: zodResolver(emailSchema) });
  const resetForm = useForm<ResetForm>({ resolver: zodResolver(resetSchema) });

  const onEmailSubmit = async (data: EmailForm) => {
    setIsSubmitting(true);
    try {
      await authService.forgotPassword(data.email);
      setEmail(data.email);
      setStep("reset");
      toast.success("Código de verificación enviado a tu email");
    } catch (error: any) {
      toast.error(error.message || "Error al enviar el código");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onResetSubmit = async (data: ResetForm) => {
    setIsSubmitting(true);
    try {
      await authService.resetPassword({
        email,
        code: data.code,
        newPassword: data.newPassword,
      });
      toast.success(auth.resetPassword.successMessage);
      router.push("/login");
    } catch (error: any) {
      toast.error(error.message || "Código inválido o expirado");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen md:h-auto flex md:items-center justify-center py-16 px-4 ">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {auth.resetPassword.title}
          </h1>
          <p className="text-muted-foreground">
            {step === "email"
              ? auth.resetPassword.subtitle
              : auth.resetPassword.codeExpiry}
          </p>
        </div>

        <div className="bg-card border-4 border-primary/60 rounded-lg p-8 shadow-sm">
          {step === "email" ? (
            <form
              onSubmit={emailForm.handleSubmit(onEmailSubmit)}
              className="space-y-4"
            >
              <div>
                <Label htmlFor="email">{auth.resetPassword.emailLabel}</Label>
                <Input
                  id="email"
                  type="email"
                  {...emailForm.register("email")}
                  placeholder={auth.resetPassword.emailPlaceholder}
                  className={
                    emailForm.formState.errors.email
                      ? "border-destructive mt-2"
                      : "border-gray-400 mt-2"
                  }
                />
                {emailForm.formState.errors.email && (
                  <p className="text-sm text-destructive mt-1">
                    {emailForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting
                  ? auth.resetPassword.submittingButton
                  : auth.resetPassword.submitButton}
              </Button>
            </form>
          ) : (
            <form
              onSubmit={resetForm.handleSubmit(onResetSubmit)}
              className="space-y-4"
            >
              <div>
                <Label htmlFor="code">{auth.resetPassword.codeLabel}</Label>
                <Input
                  id="code"
                  {...resetForm.register("code")}
                  placeholder={auth.resetPassword.codePlaceholder}
                  maxLength={6}
                  autoComplete="off"
                  inputMode="numeric"
                  className={
                    resetForm.formState.errors.code
                      ? "border-destructive"
                      : " border-gray-400"
                  }
                />
                {resetForm.formState.errors.code && (
                  <p className="text-sm text-destructive mt-1">
                    {resetForm.formState.errors.code.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="newPassword">
                  {auth.resetPassword.newPasswordLabel}
                </Label>
                <Input
                  id="newPassword"
                  type="password"
                  {...resetForm.register("newPassword")}
                  placeholder={auth.resetPassword.newPasswordPlaceholder}
                  className={
                    resetForm.formState.errors.newPassword
                      ? "border-destructive"
                      : " border-gray-400"
                  }
                />
                {resetForm.formState.errors.newPassword && (
                  <p className="text-sm text-destructive mt-1">
                    {resetForm.formState.errors.newPassword.message}
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting
                  ? auth.resetPassword.confirmingButton
                  : auth.resetPassword.confirmButton}
              </Button>
            </form>
          )}

          <div className="text-center mt-6">
            <Link
              href="/login"
              className="text-sm text-primary hover:underline"
            >
              {auth.resetPassword.backToLogin}
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
