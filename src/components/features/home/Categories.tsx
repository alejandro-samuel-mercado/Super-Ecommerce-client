"use client";

import { productService } from "@/services/products";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export function Categories() {
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    productService.getCategoriesTree().then((data) => {
      // Filtrar categorías sin productos y ordenar por cantidad de productos (mayor a menor)
      const filteredAndSorted = data
        .filter((cat: any) => cat._count?.products > 0)
        .sort(
          (a: any, b: any) =>
            (b._count?.products || 0) - (a._count?.products || 0),
        )
        .slice(0, 8);
      setCategories(filteredAndSorted);
    });
  }, []);

  return (
    <section className="py-20 relative sm:bg-muted/20 ">
      {/* Fondo decorativo sutil */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Explora por Categoría
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {categories.map((category, idx) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
            >
              <Link
                href={`/products?categoria=${category.slug}`}
                className="group block relative aspect-[3/4] rounded-2xl overflow-hidden soft-shadow hover:shadow-lg transition-all duration-300"
              >
                {/* Superposición de gradiente */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/60 via-secondary/40 to-accent/60 z-10 group-hover:opacity-90 transition-opacity" />

                <Image
                  src={`https://picsum.photos/seed/${category.slug}/400/600`}
                  alt={category.name}
                  fill
                  className="object-cover transition-transform group-hover:scale-110 mix-blend-overlay opacity-60"
                />

                <div className="absolute inset-0 p-6 z-20 text-white flex flex-col justify-end">
                  <h3 className="text-3xl font-bold mb-2 drop-shadow-lg">
                    {category.name}
                  </h3>
                  <p className="text-sm drop-shadow font-medium opacity-90">
                    {category._count?.products || 0} productos
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="text-center">
          <Link
            href="/categories"
            className="inline-flex items-center justify-center px-8 py-3 text-base font-medium text-white bg-primary rounded-full hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
          >
            Ver Todas las Categorías
          </Link>
        </div>
      </div>
    </section>
  );
}
