import { redirect } from "next/navigation";

export function generateStaticParams() {
  return [{ slug: "placeholder" }];
}

export const dynamicParams = false;

export default function LegacyProductsPage({ params }: { params: { slug: string } }) {
  redirect(`/products/detail?slug=${params.slug}`);
}
