import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BlogPost } from "@/types";
import { ArrowRight, Clock, Share2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface PostCardProps {
  post: BlogPost;
}

export function PostCard({ post }: PostCardProps) {
  const authorName = post.author?.name || post.authorName || "Admin";
  const authorAvatar =
    post.author?.avatar ||
    post.authorAvatar ||
    "https://ui-avatars.com/api/?name=" + authorName;
  const publishedDate = post.publishedAt || (post as any).createdAt;

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] border-2 border-zinc-300 dark:border-zinc-800 shadow-sm hover:shadow-2xl hover:border-primary/50 transition-all duration-500 overflow-hidden flex flex-col group h-full">
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative h-12 w-12 rounded-2xl overflow-hidden border-2 border-primary/20 p-0.5 bg-zinc-100 dark:bg-zinc-800">
            <div className="relative h-full w-full rounded-xl overflow-hidden bg-white dark:bg-zinc-900">
              <Image
                src={authorAvatar}
                alt={authorName}
                fill
                className="object-cover"
              />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-black text-base text-zinc-900 dark:text-zinc-50 leading-tight group-hover:text-primary transition-colors">
              {authorName}
            </span>
            <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400 font-black uppercase tracking-widest">
              <span>{new Date(publishedDate).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-2xl h-10 w-10 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <Share2 className="h-5 w-5" />
        </Button>
      </div>

      {/* Imagen Destacada */}
      {post.coverImage && (
        <Link
          href={`/blog/${post.slug}`}
          className="relative aspect-[16/10] w-full overflow-hidden block bg-zinc-100 dark:bg-zinc-900 border-y-2 border-zinc-100 dark:border-zinc-800/50"
        >
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-1000 group-hover:scale-105"
          />
          <div className="absolute bottom-4 left-4 z-10">
            <Badge className="bg-primary text-white border-none font-black text-[10px] px-4 py-1.5 shadow-xl uppercase tracking-widest rounded-xl">
              <Clock className="h-3 w-3 mr-1.5 inline" /> {post.readingTime} min
            </Badge>
          </div>
        </Link>
      )}

      {/* Content Section */}
      <div className="p-8 flex-1 flex flex-col">
        <Link href={`/blog/${post.slug}`}>
          <h3 className="text-2xl font-black mb-4 group-hover:text-primary transition-colors leading-[1.1] tracking-tighter text-zinc-900 dark:text-zinc-50 line-clamp-2">
            {post.title}
          </h3>
        </Link>
        <p className="text-zinc-600 dark:text-zinc-300 text-base line-clamp-3 leading-relaxed mb-8 font-bold">
          {post.excerpt}
        </p>

        {/* Footer: Tags & CTA */}
        <div className="mt-auto pt-6 border-t-2 border-zinc-50 dark:border-zinc-800 flex flex-col gap-6">
          <div className="flex flex-wrap gap-2.5">
            {post.tags.slice(0, 3).map((tag) => (
              <Link key={tag} href={`/blog?tag=${tag}`}>
                <Badge
                  variant="secondary"
                  className="bg-zinc-100 dark:bg-zinc-800 text-[11px] font-black py-1.5 px-4 border-none hover:bg-primary hover:text-white transition-all rounded-xl uppercase tracking-widest text-zinc-700 dark:text-zinc-300"
                >
                  #{tag}
                </Badge>
              </Link>
            ))}
          </div>

          <Link href={`/blog/${post.slug}`} className="w-full">
            <Button className="w-full rounded-2xl font-black text-xs h-14 bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 hover:bg-primary dark:hover:bg-primary hover:text-white transition-all shadow-2xl shadow-zinc-300 dark:shadow-none uppercase tracking-widest gap-2">
              Seguir Leyendo{" "}
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
