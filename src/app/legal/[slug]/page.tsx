import { redirect } from "next/navigation";

export function generateStaticParams() {
  return [{ slug: "placeholder" }];
}

export const dynamicParams = false;

export default function LegacyLegalPage({ params }: { params: { slug: string } }) {
  redirect(`/legal/detail?slug=${params.slug}`);
}
