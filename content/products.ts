export const products = {
  listing: {
    title: "Todos los Productos",
    itemsPerPage: 15,
    sortOptions: [
      { value: "recent", label: "Más Recientes" },
      { value: "old", label: "Más Antiguos" },
      { value: "price-asc", label: "Precio: Bajo a Alto" },
      { value: "price-desc", label: "Precio: Alto a Bajo" },
      { value: "popular", label: "Más Populares" },
      { value: "trending", label: "Tendencias" },
      { value: "discount", label: "Mayor Descuento" },
      { value: "az", label: "Alfabético (A-Z)" },
      { value: "za", label: "Alfabético (Z-A)" },
    ],
    
    filters: {
      title: "Filtros",
      clearAll: "Limpiar Todo",
      apply: "Aplicar Filtros",
      
      priceRanges: [
        { label: "Menos de {0}", min: 0, max: 25 },
        { label: "{0} - {1}", min: 25, max: 50 },
        { label: "{1} - {2}", min: 50, max: 100 },
        { label: "{2} - {3}", min: 100, max: 200 },
        { label: "Más de {3}", min: 200, max: 999999 },
      ],
      
      shipping: {
        label: "Envío Gratis",
        value: "free",
      },
      
      availability: {
        label: "Solo en Stock",
        value: "in-stock",
      },
    },
    
    noResults: "No se encontraron productos",
    loadingMore: "Cargando más productos...",
  },

  detail: {
    breadcrumbs: {
      home: "Inicio",
      products: "Productos",
    },
    
    addToCart: "Agregar al Carrito",
    buyNow: "Comprar Ahora",
    outOfStock: "Agotado",
    inStock: "En Stock",
    lowStock: "Poco Stock",
    
    quantityLabel: "Cantidad",
    skuLabel: "Seleccionar",
    
    priceLabels: {
      save: "Ahorra",
      discount: "OFF",
      compareAt: "Precio Regular",
    },
    
    tabs: {
      description: "Descripción",
      specifications: "Especificaciones",
      shipping: "Envío y Devoluciones",
      faqs: "Preguntas Frecuentes",
      reviews: "Reseñas",
    },
    
    reviews: {
      title: "Reseñas de Clientes",
      writeReview: "Escribir una Reseña",
      noReviews: "Aún no hay reseñas. ¡Sé el primero!",
      verified: "Compra Verificada",
      helpful: "Útil",
      rating: "Calificación",
      sortBy: "Ordenar por",
      sortOptions: [
        { value: "recent", label: "Más Recientes" },
        { value: "helpful", label: "Más Útiles" },
        { value: "high", label: "Mayor Calificación" },
        { value: "low", label: "Menor Calificación" },
      ],
    },
    
    recommendations: {
      title: "También te Puede Gustar",
      viewAll: "Ver Todo",
    },
    
    shipping: {
      freeShipping: "Envío gratis en pedidos superiores a {0}",
      estimatedDelivery: "Entrega estimada",
      returns: "Política de devolución de 30 días",
    },
  },
};
