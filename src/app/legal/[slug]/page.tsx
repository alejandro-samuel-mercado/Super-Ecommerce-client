"use client";

import { legal } from "@/../content/legal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "lucide-react";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";

export default function LegalPage() {
  const params = useParams();
  const slug = params.slug as string;

  const page = Object.values(legal.pages).find((p) => p.slug === slug);

  if (!page) {
    notFound();
  }

  return (
    <main className="min-h-screen py-16 pb-40 bg-gray-200 pt-28 md:pt-30 max-md:pt-10">
      <div className="container mx-auto px-40 max-md:px-8 max-w-full ">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">{page.title}</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>
              Last updated: {new Date(page.lastUpdated).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Tabla de contenido*/}
        <Card className="p-6 mb-12 border-4 border-primary/50">
          <h2 className="font-semibold mb-4">Table of Contents</h2>
          <nav className="space-y-2">
            {page.sections.map((section, idx) => (
              <a
                key={idx}
                href={`#section-${idx}`}
                className="block text-sm text-primary hover:underline"
              >
                {section.title}
              </a>
            ))}
          </nav>
        </Card>

        {/* Content Sections */}
        <div className="prose prose-slate max-w-none">
          {page.sections.map((section, idx) => (
            <section
              key={idx}
              id={`section-${idx}`}
              className="mb-12 border-b-2 border-primary/50"
            >
              <h2 className="text-2xl font-bold mb-4">{section.title}</h2>
              <div className="text-muted-foreground whitespace-pre-line">
                {section.content}
              </div>
              {idx < page.sections.length - 1 && <Separator className="mt-8" />}
            </section>
          ))}
        </div>

        {/* CTA de contacto */}
        <Card className="mt-16 p-8 text-center bg-primary/5 border-primary/20">
          <h3 className="text-2xl font-bold mb-2">{legal.contact.title}</h3>
          <p className="text-muted-foreground mb-6">{legal.contact.subtitle}</p>
          <Link href={legal.contact.ctaLink}>
            <Button size="lg">{legal.contact.cta}</Button>
          </Link>
        </Card>
      </div>
    </main>
  );
}
