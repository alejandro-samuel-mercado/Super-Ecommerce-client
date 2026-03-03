"use client";

import { blog as blogContent } from "@/../content/blog";
import { PostCard } from "@/components/blog/PostCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { blogService } from "@/services/blog";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { useState } from "react";

export default function BlogPage() {
  const [tag, setTag] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 9;

  const { data: postsData, isLoading: postsLoading } = useQuery({
    queryKey: ["blog-posts", tag, search, page],
    queryFn: () =>
      blogService.getPosts({
        tag: tag || undefined,
        search,
        page,
        limit: pageSize,
      }),
  });

  const { data: tags } = useQuery({
    queryKey: ["blog-tags"],
    queryFn: () => blogService.getTags(),
  });

  const posts = postsData?.data || [];
  const totalPages = postsData?.totalPages || 1;

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main className="min-h-screen  pb-20">
      <div className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent -z-10" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-50 -z-10 animate-pulse" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-secondary/10 rounded-full blur-3xl opacity-50 -z-10" />

        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tighter leading-[0.9] text-zinc-900 dark:text-zinc-50 animate-in fade-in slide-in-from-bottom-6 duration-1000">
              {blogContent.listing.title}
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
              {blogContent.listing.subtitle}
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-md:px-0">
        <div className="max-w-5xl  mx-auto mb-20 px-6 py-8 bg-white dark:bg-zinc-900 rounded-[3rem] border-4 border-secondary/20 dark:border-zinc-800 shadow-2xl shadow-zinc-200/40 dark:shadow-none">
          <div className="flex flex-col gap-8">
            <div className="relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-zinc-400 group-focus-within:text-primary transition-colors" />
              <Input
                placeholder={blogContent.listing.filters.search}
                className="pl-16 h-16 rounded-[2rem] border-2 border-zinc-400 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/50 focus-visible:ring-primary/20 transition-all text-lg font-black placeholder:text-zinc-400"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 justify-center lg:justify-start">
              <Button
                variant={!tag ? "default" : "secondary"}
                size="lg"
                className={`rounded-2xl px-8 font-black text-xs uppercase tracking-[0.1em] transition-all h-12 shadow-xl ${!tag ? "bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 animate-in zoom-in-95 duration-300" : "bg-white dark:bg-zinc-800 border-2 border-zinc-100 dark:border-zinc-700 text-zinc-500 hover:border-primary/30"}`}
                onClick={() => {
                  setTag(null);
                  setPage(1);
                }}
              >
                TODOS
              </Button>
              {tags?.map((t) => (
                <Button
                  key={t}
                  variant={tag === t ? "default" : "secondary"}
                  size="lg"
                  className={`rounded-2xl px-8 font-black text-xs uppercase tracking-[0.1em] transition-all h-12 shadow-xl ${tag === t ? "bg-primary text-white scale-105" : "bg-white dark:bg-zinc-800 border-2 border-zinc-300 dark:border-zinc-700 text-zinc-500 hover:border-primary/30"}`}
                  onClick={() => {
                    setTag(t);
                    setPage(1);
                  }}
                >
                  #{t}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <div className="mb-20 max-w-7xl mx-6">
          {postsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-zinc-900 rounded-[2.5rem] border-2 border-zinc-100 dark:border-zinc-800 h-[550px] animate-pulse shadow-sm"
                />
              ))}
            </div>
          ) : posts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mb-20 animate-in fade-in slide-in-from-bottom-10 duration-1000  max-md:px-10  max-sm:px-3">
                {posts.map((post) => (
                  <PostCard key={post.slug} post={post} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 py-10 border-t border-zinc-100 dark:border-zinc-800">
                  <Button
                    variant="outline"
                    className="rounded-2xl h-12 w-32 font-black text-[10px] uppercase tracking-widest disabled:opacity-30 border-2"
                    disabled={page === 1}
                    onClick={() => handlePageChange(page - 1)}
                  >
                    Anterior
                  </Button>
                  <div className="flex items-center gap-2">
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => handlePageChange(i + 1)}
                        className={`w-10 h-10 rounded-xl font-black text-xs transition-all ${page === i + 1 ? "bg-primary text-white scale-110 shadow-lg shadow-primary/20" : "bg-white dark:bg-zinc-800 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700"}`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    className="rounded-2xl h-12 w-32 font-black text-[10px] uppercase tracking-widest disabled:opacity-30 border-2"
                    disabled={page === totalPages}
                    onClick={() => handlePageChange(page + 1)}
                  >
                    Siguiente
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-32 bg-white dark:bg-zinc-900 rounded-[3rem] border-4 border-dashed border-zinc-100 dark:border-zinc-800 shadow-2xl shadow-zinc-200/50 dark:shadow-none">
              <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-3xl font-black mb-3 tracking-tight">
                {blogContent.empty.title}
              </h2>
              <p className="text-muted-foreground font-medium text-lg max-w-md mx-auto mb-10">
                {blogContent.empty.subtitle}
              </p>
              <Button
                variant="default"
                size="lg"
                className="rounded-2xl px-12 h-14 font-black uppercase tracking-widest shadow-xl shadow-primary/20"
                onClick={() => {
                  setTag(null);
                  setSearch("");
                  setPage(1);
                }}
              >
                Limpiar filtros
              </Button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
