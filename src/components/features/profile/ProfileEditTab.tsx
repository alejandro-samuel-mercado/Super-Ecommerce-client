"use client";

import { profile } from "@/../content/profile";
import { http } from "@/adapters/http";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { User } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Settings } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

const profileSchema = z.object({
  name: z.string().min(2, "El nombre es requerido"), 
  phone: z.string().optional(),
  dni: z.string().optional(),
  direccion: z.string().optional(),
  ciudad: z.string().optional(),
  provincia: z.string().optional(),
  codigoPostal: z.string().optional(),
  pais: z.string().optional(),
});

type ProfileForm = z.infer<typeof profileSchema>;

interface ProfileEditTabProps {
  user: User;
}

export function ProfileEditTab({ user }: ProfileEditTabProps) {
  const { refreshUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name || "",
      phone: user.phone || "",
      dni: user.dni || "",
      direccion: user.address || "",
      ciudad: user.city || "",
      provincia: user.state || user.province || "",
      codigoPostal: user.zipCode || "",
      pais: user.country || "",
    },
  });

  const onSubmit = async (data: ProfileForm) => {
    setIsSubmitting(true);
    try {
      const payload = {
        name: data.name,
        phone: data.phone,
        dni: data.dni,
        address: data.direccion,
        city: data.ciudad,
        state: data.provincia,
        zipCode: data.codigoPostal,
        country: data.pais,
      };

      await http("/api/users/profile", {
        method: "PUT",
        body: JSON.stringify(payload),
      });
     
      setIsEditing(false);
      await refreshUser();
    } catch (error) {
      toast.error("Error al actualizar perfil");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isEditing) {
    return (
      <div className="space-y-12">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-black mb-2 tracking-tight">
              Detalles de Cuenta
            </h2>
            <p className="text-gray-500 font-medium">
              Gestiona tu información personal y preferencias de contacto.
            </p>
          </div>
          <Button
            onClick={() => setIsEditing(true)}
            variant="outline"
            className="rounded-2xl bg-white/5 border-4 border-primary/30 hover:bg-primary hover:text-white transition-all"
          >
            <Settings className="w-4 h-4 mr-2" /> Editar Perfil
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-4 border-primary/30 rounded-3xl p-4">
          <div className="space-y-1 group">
            <Label className="text-[10px] uppercase font-black text-gray-700 tracking-widest pl-1">
              Identificador Único
            </Label>
            <div className="bg-white/5 p-4 ">
              <p className="font-mono text-sm text-gray-600">{user.id}</p>
            </div>
          </div>

          <div className="space-y-1 group">
            <Label className="text-[10px] uppercase font-black text-gray-700 tracking-widest pl-1">
              Correo Electrónico
            </Label>
            <div className="bg-white/5 p-4 ">
              <p className="font-medium text-gray-600">{user.email}</p>
            </div>
          </div>

          <div className="space-y-1 group">
            <Label className="text-[10px] uppercase font-black text-gray-700 tracking-widest pl-1">
              Teléfono Móvil
            </Label>
            <div className="bg-white/5 p-4 ">
              <p className="font-medium text-gray-600">
                {user.phone || "No proporcionado"}
              </p>
            </div>
          </div>

          <div className="space-y-1 group">
            <Label className="text-[10px] uppercase font-black text-gray-700 tracking-widest pl-1">
              Documento (DNI)
            </Label>
            <div className="bg-white/5 p-4 ">
              <p className="font-medium text-gray-600">
                {user.dni || "No proporcionado"}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4 border-4 border-primary/30 p-4 rounded-3xl">
          <Label className="text-[10px] uppercase font-black text-gray-500 tracking-widest pl-1">
            Dirección de Envío Principal
          </Label>
          <div className="bg-white/5 p-6 rounded-[2rem] border border-white/5 grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-[10px] text-gray-500 uppercase font-black mb-1">
                Calle
              </p>
              <p className="text-sm font-medium">{user.address || "-"}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-500 uppercase font-black mb-1">
                Ciudad
              </p>
              <p className="text-sm font-medium">{user.city || "-"}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-500 uppercase font-black mb-1">
                Provincia
              </p>
              <p className="text-sm font-medium">
                {user.state || user.province || "-"}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-gray-500 uppercase font-black mb-1">
                C.P.
              </p>
              <p className="text-sm font-medium">{user.zipCode || "-"}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card className="border-transparent p-6 max-w-full px-20 max-md:px-4 rounded-[2rem]">
      <div className="flex justify-between items-center mb-6 ">
        <h2 className="text-2xl font-semibold">{profile.profileEdit.title}</h2>
        <Button
          variant="ghost"
          className="bg-secondary/60"
          onClick={() => setIsEditing(false)}
        >
          Cancelar
        </Button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="name">Nombre Completo</Label>
          <Input
            id="name"
            {...register("name")}
            placeholder="Juan Perez"
            className={
              errors.name
                ? "border-destructive"
                : "border-2 border-primary  placeholder:text-gray-400/70"
            }
          />
          {errors.name && (
            <p className="text-sm text-destructive mt-1">
              {errors.name.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="email">
            {profile.profileEdit.fields.email.label}
          </Label>
          <Input
            id="email"
            value={user.email}
            disabled
            className="bg-muted border-2 border-primary  placeholder:text-gray-400/70"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="phone">Teléfono</Label>
            <Input
              id="phone"
              {...register("phone")}
              placeholder="+1234567890"
              className="border-2 border-primary  placeholder:text-gray-400/70"
            />
          </div>
          <div>
            <Label htmlFor="dni">DNI</Label>
            <Input
              id="dni"
              {...register("dni")}
              placeholder="12345678"
              className="border-2 border-primary  placeholder:text-gray-400/70"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="direccion">Dirección</Label>
          <Input
            id="direccion"
            {...register("direccion")}
            placeholder="Street 123"
            className="border-2 border-primary  placeholder:text-gray-400/70"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="ciudad">Ciudad</Label>
            <Input
              id="ciudad"
              {...register("ciudad")}
              placeholder="New York"
              className="border-2 border-primary  placeholder:text-gray-400/70"
            />
          </div>
          <div>
            <Label htmlFor="provincia">Provincia/Estado</Label>
            <Input
              id="provincia"
              {...register("provincia")}
              placeholder="NY"
              className="border-2 border-primary  placeholder:text-gray-400/70"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="codigoPostal">Código Postal</Label>
            <Input
              id="codigoPostal"
              {...register("codigoPostal")}
              placeholder="10001"
              className="border-2 border-primary  placeholder:text-gray-400/70"
            />
          </div>
          <div>
            <Label htmlFor="pais">País</Label>
            <Input
              id="pais"
              {...register("pais")}
              placeholder="USA"
              className="border-2 border-primary  placeholder:text-gray-400/70"
            />
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <Button type="submit" disabled={isSubmitting} className="flex-1">
            {isSubmitting
              ? profile.profileEdit.savingButton
              : profile.profileEdit.saveButton}
          </Button>
        </div>
      </form>
    </Card>
  );
}
