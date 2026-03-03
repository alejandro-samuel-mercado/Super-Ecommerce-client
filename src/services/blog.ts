import { http } from "@/adapters/http";
import { BlogPost, SearchResult } from "@/types";

export const blogService = {
  getPosts: async (
    params: {
      page?: number;
      limit?: number;
      tag?: string;
      search?: string;
    } = {},
  ) => {
    const query = new URLSearchParams();
    if (params.page) query.append("page", params.page.toString());
    if (params.limit) query.append("limit", params.limit.toString());
    if (params.tag) query.append("tag", params.tag);
    if (params.search) query.append("search", params.search);

    return http<SearchResult<BlogPost>>(`/api/blog?${query.toString()}`);
  },

  getPost: async (slug: string) => {
    return http<BlogPost>(`/api/blog/${slug}`);
  },

  getTags: async () => {
    return http<string[]>("/api/blog/tags");
  },

  getRelatedPosts: async (slug: string, limit: number = 3) => {
    return http<BlogPost[]>(`/api/blog/${slug}/related?limit=${limit}`);
  },
};
