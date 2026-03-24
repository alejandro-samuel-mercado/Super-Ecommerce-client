"use client";

import { blog as blogContent } from "@/../content/blog";
import { PostCard } from "@/components/blog/PostCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { BlogPost } from "@/types";
import { ArrowRight, Calendar, Clock, Share2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { blogService } from "@/services/blog";

interface BlogPostClientProps {
    slug: string;
    initialPost?: BlogPost;
    initialRelatedPosts?: BlogPost[];
}

export function BlogPostClient({
    slug: initialSlug,
    initialPost,
    initialRelatedPosts
}: BlogPostClientProps) {
    const searchParams = useSearchParams();
    const slug = initialSlug || searchParams.get('slug') || "";

    const { data: post, isLoading } = useQuery({
        queryKey: ["blog-post", slug],
        queryFn: () => blogService.getPost(slug),
        initialData: initialPost,
    });

    const { data: relatedPosts } = useQuery({
        queryKey: ["related-posts", slug],
        queryFn: () => blogService.getRelatedPosts(slug, 3),
        enabled: !!post,
        initialData: initialRelatedPosts,
    });

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: post?.title,
                    url: window.location.href,
                });
            } catch (err) {

            }
        } else {
            navigator.clipboard.writeText(window.location.href);
            toast.success(blogContent.post.share.copied);
        }
    };

    if (isLoading && !post) {
        return (
            <div className="min-h-screen flex items-center justify-center pt-20">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center pt-20 px-4 text-center">
                <h2 className="text-3xl font-black mb-4">Post no encontrado</h2>
                <p className="text-muted-foreground mb-8">
                    El artículo que buscas no existe o ha sido movido.
                </p>
                <Link href="/blog">
                    <Button variant="default" className="rounded-full px-8 font-bold">
                        Volver al Blog
                    </Button>
                </Link>
            </div>
        );
    }

    const authorName = post.author?.name || post.authorName || "Admin";
    const authorAvatar =
        post.author?.avatar ||
        post.authorAvatar ||
        "https://ui-avatars.com/api/?name=" + authorName;
    const publishedDate = post.publishedAt || (post as any).createdAt;

    return (
        <main className="min-h-screen pb-32 pt-20 max-md:pt-0 md:px-20 max-sm:px-4">
            <div className="relative pt-16 pb-20 overflow-hidden">
                <div className="absolute inset-0  -z-10" />
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] -mr-48 -mt-48 animate-pulse" />

                <div className="container mx-auto px-4">
                    <article className="max-w-4xl mx-auto">
                        <Link
                            href="/blog"
                            className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-white dark:bg-zinc-900 border-2 border-zinc-400/60 dark:border-zinc-800 text-sm font-black uppercase tracking-widest text-zinc-500 hover:text-primary hover:border-primary/30 transition-all group mb-12 shadow-xl shadow-zinc-200/50 dark:shadow-none"
                        >
                            <ArrowRight className="h-4 w-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
                            Volver al Feed
                        </Link>

                        <div className="flex flex-wrap gap-3 mb-8">
                            {post.tags.map((tag) => (
                                <Link key={tag} href={`/blog?tag=${tag}`}>
                                    <Badge className="bg-primary/10 text-primary hover:bg-primary hover:text-white border-none font-black text-[11px] px-5 py-2 rounded-xl transition-all uppercase tracking-[0.2em]">
                                        #{tag}
                                    </Badge>
                                </Link>
                            ))}
                        </div>

                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-10 tracking-tighter leading-[0.95] text-zinc-900 dark:text-zinc-50 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                            {post.title}
                        </h1>

                        <div className="flex flex-wrap items-center gap-8 py-8 border-y-4 border-zinc-900/5 dark:border-zinc-50/5">
                            <div className="flex items-center gap-4">
                                <div className="relative h-14 w-14 rounded-2xl overflow-hidden border-2 border-primary/20 p-0.5 bg-zinc-100 dark:bg-zinc-800">
                                    <div className="relative h-full w-full rounded-xl overflow-hidden bg-white dark:bg-zinc-900">
                                        <Image
                                            src={authorAvatar}
                                            alt={authorName}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <p className="text-lg font-black text-zinc-900 dark:text-white leading-none mb-1">
                                        {authorName}
                                    </p>
                                    <p className="text-[11px] text-primary font-black uppercase tracking-widest">
                                        Autor Verificado
                                    </p>
                                </div>
                            </div>

                            <div className="h-12 w-[2px] bg-zinc-100 dark:bg-zinc-800 hidden md:block" />

                            <div className="flex items-center gap-8">
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-zinc-400 font-black uppercase tracking-widest mb-1.5">
                                        Publicado
                                    </span>
                                    <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-black text-sm">
                                        <Calendar className="h-4 w-4 text-primary" />
                                        <span>
                                            {new Date(publishedDate).toLocaleDateString("es-ES", {
                                                day: "numeric",
                                                month: "long",
                                                year: "numeric",
                                            })}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-zinc-400 font-black uppercase tracking-widest mb-1.5">
                                        Lectura
                                    </span>
                                    <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-black text-sm">
                                        <Clock className="h-4 w-4 text-primary" />
                                        <span>{post.readingTime} min</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 md:text-right">
                                <Button
                                    onClick={handleShare}
                                    className="rounded-2xl h-14 px-8 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 font-black uppercase tracking-widest text-xs gap-3 hover:bg-primary dark:hover:bg-primary hover:text-white transition-all shadow-2xl"
                                >
                                    <Share2 className="h-5 w-5" />
                                    Compartir Historia
                                </Button>
                            </div>
                        </div>
                    </article>
                </div>
            </div>

            <div className="container mx-auto px-4">
                <article className="max-w-4xl mx-auto">
                    {post.coverImage && (
                        <div className="relative aspect-[21/9] mb-20 rounded-[3.5rem] overflow-hidden border-8 border-white dark:border-zinc-900 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] dark:shadow-none animate-in fade-in zoom-in-95 duration-1000">
                            <Image
                                src={post.coverImage}
                                alt={post.title}
                                fill
                                className="object-cover"
                                priority
                            />
                        </div>
                    )}

                    <div
                        className="prose prose-zinc dark:prose-invert prose-2xl max-w-none mb-32 
            prose-headings:font-black prose-headings:tracking-tighter prose-headings:text-zinc-900 dark:prose-headings:text-zinc-50
            prose-p:text-zinc-600 dark:prose-p:text-zinc-400 prose-p:leading-[1.6] prose-p:font-bold
            prose-strong:text-zinc-900 dark:prose-strong:text-zinc-50 prose-strong:font-black
            prose-a:text-primary prose-a:font-black prose-a:underline-offset-4 decoration-primary/30
            prose-img:rounded-[3rem] prose-img:border-8 prose-img:border-zinc-50 dark:prose-img:border-zinc-900
            prose-blockquote:border-l-[8px] prose-blockquote:border-primary prose-blockquote:bg-zinc-50 dark:prose-blockquote:bg-zinc-900/50 prose-blockquote:rounded-[2rem] prose-blockquote:px-12 prose-blockquote:py-4 prose-blockquote:italic prose-blockquote:font-black prose-blockquote:text-zinc-900 dark:prose-blockquote:text-zinc-100"
                    >
                        <div dangerouslySetInnerHTML={{ __html: post.content }} />
                    </div>

                    <div className="relative p-12 mb-32 bg-zinc-200 dark:bg-zinc-900 rounded-[3.5rem] border-4 border-zinc-100 dark:border-zinc-800 shadow-2xl shadow-zinc-200/50 dark:shadow-none overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-primary/10 transition-colors" />

                        <div className="flex flex-col md:flex-row items-center md:items-start gap-12 relative z-10">
                            <div className="relative h-32 w-32 rounded-[2.5rem] overflow-hidden flex-shrink-0 border-4 border-zinc-50 dark:border-zinc-800 shadow-2xl transition-transform duration-500 group-hover:scale-105">
                                <Image
                                    src={authorAvatar}
                                    alt={authorName}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div className="text-center md:text-left flex-1">
                                <p className="text-[11px] font-black text-primary uppercase tracking-[0.3em] mb-4">
                                    {blogContent.post.author.aboutAuthor}
                                </p>
                                <h3 className="font-black text-4xl mb-6 text-zinc-900 dark:text-white tracking-tighter">
                                    {authorName}
                                </h3>
                                <p className="text-zinc-500 dark:text-zinc-400 text-lg leading-relaxed font-bold italic">
                                    {post.author?.bio || post.authorBio || "Experto apasionado por compartir historias que inspiran y educan a nuestra comunidad. Comprometido con la excelencia y la innovación en cada palabra."}
                                </p>
                            </div>
                        </div>
                    </div>

                    <Separator className="mb-24 h-[4px] bg-zinc-900/5 dark:bg-zinc-50/5 rounded-full" />

                    {relatedPosts && relatedPosts.length > 0 && (
                        <section className="mb-32">
                            <div className="flex items-center justify-between mb-12">
                                <h2 className="text-4xl md:text-5xl font-black tracking-tighter">
                                    {blogContent.post.tags.relatedPosts}
                                </h2>
                                <Link href="/blog">
                                    <Button
                                        variant="ghost"
                                        className="font-black text-xs uppercase tracking-widest text-primary gap-2"
                                    >
                                        Ver todos <ArrowRight className="h-4 w-4" />
                                    </Button>
                                </Link>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                                {relatedPosts.map((related) => (
                                    <PostCard key={related.slug} post={related} />
                                ))}
                            </div>
                        </section>
                    )}
                </article>
            </div>
        </main>
    );
}
