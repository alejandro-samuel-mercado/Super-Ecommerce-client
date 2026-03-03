"use client";

import { profile } from "@/../content/profile";
import { http } from "@/adapters/http";
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
import { Address } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { Edit, MapPin, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function AddressesTab() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: addresses, refetch } = useQuery({
    queryKey: ["addresses"],
    queryFn: async () => {
      const response = await http<{ success: boolean; data: Address[] }>(
        "/api/users/addresses",
      );
      return response.data;
    },
  });

  const handleDelete = async (id: string) => {
    try {
      await http(`/api/users/addresses/${id}`, { method: "DELETE" });
      toast.success("Dirección eliminada");
      refetch();
    } catch (error) {
      toast.error("Error al eliminar dirección");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">{profile.addresses.title}</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {profile.addresses.addButton}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Agregar Nueva Dirección</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>{profile.addresses.fields.street.label}</Label>
                <Input
                  placeholder={profile.addresses.fields.street.placeholder}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{profile.addresses.fields.city.label}</Label>
                  <Input
                    placeholder={profile.addresses.fields.city.placeholder}
                  />
                </div>
                <div>
                  <Label>{profile.addresses.fields.zip.label}</Label>
                  <Input
                    placeholder={profile.addresses.fields.zip.placeholder}
                  />
                </div>
              </div>
              <Button className="w-full">Guardar Dirección</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {addresses?.map((address) => (
          <Card key={address.id} className="p-4">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-1 text-muted-foreground" />
                <div>
                  <p className="font-medium">{address.street}</p>
                  <p className="text-sm text-muted-foreground">
                    {address.city}, {address.state} {address.zip}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {address.phone}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline">
                <Edit className="h-3 w-3 mr-1" />
                {profile.addresses.editButton}
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => address.id && handleDelete(address.id)}
              >
                <Trash2 className="h-3 w-3 mr-1" />
                {profile.addresses.deleteButton}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
