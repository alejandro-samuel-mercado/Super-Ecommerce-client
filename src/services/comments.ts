import { http } from "@/adapters/http";

export interface Comment {
  id: number;
  content: string;
  rating: number | null;
  createdAt: string;
  user: {
    id: number;
    name: string;
    profileImage: string | null;
  };
  product: {
    id: number;
    name: string;
    images: string[];
  };
}

export const commentService = {
  getTestimonials: async (limit: number = 12): Promise<Comment[]> => {
    const response = await http<{ success: boolean; data: Comment[] }>(
      `/api/comments/testimonials?limit=${limit}`,
    );
    return response.data;
  },

  getProductComments: async (productId: number): Promise<Comment[]> => {
    const response = await http<{ success: boolean; data: Comment[] }>(
      `/api/comments/product/${productId}`,
    );
    return response.data;
  },

  createComment: async (data: {
    productId: number;
    content: string;
    rating: number;
  }): Promise<Comment> => {
    const response = await http<{
      success: boolean;
      data: Comment;
      message: string;
    }>("/api/comments", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return response.data;
  },
};
