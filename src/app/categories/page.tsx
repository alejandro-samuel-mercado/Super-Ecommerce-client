"use client";

import { Button } from "@/components/ui/button";
import { productService } from "@/services/products";
import { motion } from "framer-motion";
import { ChevronRight, Package2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function CategoriesPage() {
  const router = useRouter();
  const [currentLevelCats, setCurrentLevelCats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fullTree, setFullTree] = useState<any[]>([]);
  const [breadcrumbs, setBreadcrumbs] = useState<any[]>([]);




  useEffect(() => {
    productService.getCategoriesTree().then((tree) => {
      setFullTree(tree);
      setCurrentLevelCats(tree);
      setLoading(false);
    });
  }, []);

  const handleCategoryClick = (category: any) => {
    if (category.children && category.children.length > 0) {
      setBreadcrumbs([...breadcrumbs, category]);
      setCurrentLevelCats(category.children);
    } else {
      router.push(`/products?categoria=${category.slug}`);
    }
  };

  const handleBreadcrumbClick = (index: number) => {
    if (index === -1) {
      setBreadcrumbs([]);
      setCurrentLevelCats(fullTree);
    } else {
      const newBreadcrumbs = breadcrumbs.slice(0, index + 1);
      setBreadcrumbs(newBreadcrumbs);
      setCurrentLevelCats(newBreadcrumbs[newBreadcrumbs.length - 1].children);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen py-20 text-center pt-32 max-md:pt-20">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen py-12 pt-32 max-md:pt-20 max-lg:px-10 max-md:px-2 pb-24">
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Todas las Categorías</h1>
          <p className="text-muted-foreground text-lg">
            Encuentra lo que buscas navegando por nuestras categorías
          </p>
        </div>

      
        {breadcrumbs.length > 0 && (
          <div className="flex items-center gap-2 text-sm mb-6 pb-4 border-b">
            {breadcrumbs.map((crumb, idx) => (
              <div key={crumb.id} className="flex items-center gap-2">
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                <button
                  onClick={() => handleBreadcrumbClick(idx)}
                  className={`transition-colors ${
                    idx === breadcrumbs.length - 1
                      ? "text-foreground font-medium"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {crumb.name}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Grid de categorías */}
        <div className="grid grid-cols-4 max-lg:grid-cols-3 max-md:grid-cols-2 gap-4">
          {currentLevelCats.map((category, idx) => {
            const hasChildren =
              category.children && category.children.length > 0;
            const productCount = category._count?.products || 0;

            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05, duration: 0.3 }}
              >
                <button
                  onClick={() => handleCategoryClick(category)}
                  className="w-full text-left group"
                >
                  <div className="relative aspect-[4/3] max-md:aspect-[1] rounded-lg overflow-hidden mb-3 bg-muted">
                    {/* Imagen de la categoría */}
                    <Image
                      src={category.slug}
                      alt={category.name}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                    {/* Información de la categoría */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                      <h3 className="font-semibold text-lg mb-1 line-clamp-1">
                        {category.name}
                      </h3>
                      {hasChildren ? (
                        <p className="text-xs text-white/80">
                          {category.children.length} subcategorías
                        </p>
                      ) : (
                        <p className="text-xs text-white/80">
                          {productCount} productos
                        </p>
                      )}
                    </div>

                    {/* Indicador de flecha */}
                    <div className="absolute top-3 right-3">
                      <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center transition-transform group-hover:scale-110 group-hover:bg-white">
                        <ChevronRight className="h-4 w-4 text-gray-800" />
                      </div>
                    </div>
                  </div>
                </button>
              </motion.div>
            );
          })}
        </div>

        {/* Botón de volver */}
        {breadcrumbs.length > 0 && (
          <div className="mt-8 flex justify-center">
            <Button
              variant="outline"
              onClick={() => handleBreadcrumbClick(breadcrumbs.length - 2)}
            >
              <ChevronRight className="h-4 w-4 mr-2 rotate-180" />
              Volver
            </Button>
          </div>
        )}

        {/* Estado vacío */}
        {currentLevelCats.length === 0 && (
          <div className="text-center py-16">
            <Package2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">
              No hay categorías disponibles
            </h3>
            <p className="text-muted-foreground mb-6">
              Vuelve atrás o explora otras opciones
            </p>
            <Button onClick={() => router.push("/products")}>
              Ver Todos los Productos
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}
