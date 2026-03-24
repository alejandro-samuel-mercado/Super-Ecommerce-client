import { Benefits } from "@/components/features/home/Benefits";
import CartAnimation from "@/components/features/home/CartAnimation";
import { Categories } from "@/components/features/home/Categories";
import { Hero } from "@/components/features/home/Hero";
import { Marquee } from "@/components/features/home/Marquee";
import { NewProducts } from "@/components/features/home/NewProducts";
import { SecondaryAds } from "@/components/features/home/SecondaryAds";
import { Testimonials } from "@/components/features/home/Testimonials";
import { TrendingProducts } from "@/components/features/home/TrendingProducts";
import dynamic from "next/dynamic";

const InstitutionalVideo = dynamic(
    () => import("@/components/features/home/InstitutionalVideo").then((mod) => mod.InstitutionalVideo),
    { ssr: false }
);

export default function HomePage() {
    return (
        <main className="min-h-screen relative  md:px-10">
            <Hero />

            <Marquee />

            <Benefits />
            <InstitutionalVideo />
            <CartAnimation />
            <TrendingProducts />
            <NewProducts />
            <SecondaryAds />
            <Categories />
            <CartAnimation invert={true} />
            <Testimonials />
        </main>
    );
}
