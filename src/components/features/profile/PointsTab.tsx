"use client";

import { profile } from "@/../content/profile";
import { http } from "@/adapters/http";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Award, TrendingDown, TrendingUp } from "lucide-react";

interface PointsData {
  balance: number;
  earned: number;
  used: number;
  expired: number;
  history: Array<{
    id: string;
    type: "EARNED" | "USED" | "EXPIRED";
    amount: number;
    reason: string;
    date: string;
  }>;
}

export function PointsTab() {
  const { data: pointsData, isLoading } = useQuery({
    queryKey: ["points"],
    queryFn: async () => {
      const response = await http<{ success: boolean; data: PointsData }>(
        "/api/users/points",
      );
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-32 bg-gray-100 animate-pulse rounded-2xl"
            />
          ))}
        </div>
        <div className="h-64 bg-gray-100 animate-pulse rounded-2xl" />
      </div>
    );
  }

  if (!pointsData) return null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="p-6 text-center border-4 border-primary/20">
          <Award className="h-8 w-8 mx-auto mb-2 text-primary" />
          <p className="text-sm text-muted-foreground">Puntos </p>
          <p className="text-3xl font-bold">{pointsData?.balance || 0}</p>
        </Card>

        <Card className="p-6 text-center border-4 border-primary/20">
          <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-500" />
          <p className="text-sm text-muted-foreground">
            {profile.points.earned}
          </p>
          <p className="text-3xl font-bold">{pointsData?.earned || 0}</p>
        </Card>

        <Card className="p-6 text-center border-4 border-primary/20">
          <TrendingDown className="h-8 w-8 mx-auto mb-2 text-red-500" />
          <p className="text-sm text-muted-foreground">{profile.points.used}</p>
          <p className="text-3xl font-bold">{pointsData?.used || 0}</p>
        </Card>

        <Card className="p-6 text-center border-4 border-primary/20">
          <div className="h-8 w-8 mx-auto mb-2 rounded-full bg-muted flex items-center justify-center">
            <span className="text-lg">⏰</span>
          </div>
          <p className="text-sm text-muted-foreground">
            {profile.points.expired}
          </p>
          <p className="text-3xl font-bold">{pointsData?.expired || 0}</p>
        </Card>
      </div>

      <Card className="p-6 border-4 border-primary/20">
        <h3 className="font-semibold mb-4">{profile.points.history}</h3>
        <div className="space-y-3">
          {!pointsData?.history || pointsData.history.length === 0 ? (
            <p className="text-center py-4 text-muted-foreground">
              No hay historial de puntos.
            </p>
          ) : (
            pointsData.history.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center py-2 border-b border-secondary/40 last:border-0"
              >
                <div>
                  <p className="font-medium">
                    {item.reason ||
                      (item.type === "EARNED"
                        ? "Puntos Ganados"
                        : "Puntos Usados")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(item.date).toLocaleDateString()}
                  </p>
                </div>
                <p
                  className={`font-bold ${
                    item.type === "EARNED"
                      ? "text-green-600"
                      : item.type === "USED"
                        ? "text-red-600"
                        : "text-muted-foreground"
                  }`}
                >
                  {item.type === "EARNED" ? "+" : "-"}
                  {item.amount}
                </p>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
