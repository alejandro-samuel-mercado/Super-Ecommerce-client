import { redirect } from "next/navigation";

export function generateStaticParams() {
  return [{ slug: "placeholder" }];
}

export const dynamicParams = false;

export default function LegacyBlogPage({ params }: { params: { slug: string } }) {
  redirect(`/blog/detail?slug=${params.slug}`);
}
