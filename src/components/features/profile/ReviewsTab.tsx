"use client";

import { profile } from "@/../content/profile";
import { http } from "@/adapters/http";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Star } from "lucide-react";
import Link from "next/link";

interface Comment {
  id: number;
  content: string;
  rating: number;
  approved: boolean;
  createdAt: string;
  product?: {
    id: number;
    name: string;
  };
}

export function ReviewsTab() {
  const { data: comments, isLoading } = useQuery({
    queryKey: ["my-comments"],
    queryFn: async () => {
      const response = await http<{ success: boolean; data: Comment[] }>(
        "/api/comments/my",
      );
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-gray-100 animate-pulse rounded-2xl" />
        ))}
      </div>
    );
  }

  if (!comments || comments.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-xl text-muted-foreground mb-6 font-medium">
          {profile.comments.noComments}
        </p>
        <Link href="/">
          <Button className="rounded-full bg-gradient-to-r from-primary to-secondary hover:shadow-lg transition-all text-lg px-8 h-12">
            Ver Productos
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {comments.map((comment) => (
          <Card key={comment.id} className="p-6 border-4 border-primary/40 ">
            <div className="flex justify-between items-start mb-2">
              <div>
                <Link
                  href={
                    comment.product ? `/product/${comment.product.id}` : "#"
                  }
                  className="font-bold text-lg hover:text-primary transition-colors"
                >
                  {comment.product?.name || "Comentario General"}
                </Link>
                <div className="flex gap-1 mt-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < (comment.rating || 0) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                    />
                  ))}
                </div>
              </div>
              <span
                className={`text-xs px-2 py-1 rounded-full ${comment.approved ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}
              >
                {comment.approved ? "Aprobado" : "Pendiente"}
              </span>
            </div>
            <p className="text-gray-600 mt-4 italic">&quot;{comment.content}&quot;</p>
            <p className="text-xs text-muted-foreground mt-4">
              Publicado el {new Date(comment.createdAt).toLocaleDateString()}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}
