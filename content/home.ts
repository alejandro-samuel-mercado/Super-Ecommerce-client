export const home = {
  hero: {
    carousel: {
      autoPlayInterval: 5000, // 5 seconds
      transitionDuration: 800,
      slides: [
        {
          id: 1,
          title: "Encuentra Lo Que Amas,",
          titleLine2: "Ama Lo Que Compras",
          subtitle: "Eleva tu orgullo 'Shop City' con mercancía exclusiva de la Fundación Shop City.",
          image: "/images/hero/image1.jpg", 
          imageAlt: "Comprador feliz con bolsas coloridas",
          backgroundColor: "#FFB4C8", 
          cta: {
            primary: { text: "Comprar Ahora", href: "/products" },
            secondary: { text: "Aprender Más", href: "/about" },
          },
        },
        {
          id: 2,
          title: "Eleva",
          titleLine2: "Tu Ser",
          subtitle: "Seguridad en cada capa, con comodidad confiable. Nuestra calidad asegura satisfacción y paz.",
          image: "/images/hero/image2.jpg", 
          imageAlt: "Persona con bolsas de compra",
          backgroundColor: "#E87461", 
          cta: {
            primary: { text: "Comprar Ahora", href: "/products" },
            secondary: { text: "Ver Colección", href: "/products?sort=newest" },
          },
        },
        
        {
          id: 3,
          title: "Descubre los Estilos Más Nuevos",
          titleLine2: "a Precios Que Te Encantarán",
          subtitle: "Tenemos algo para todos en nuestra boutique de moda. Ya sea que busques un nuevo atuendo diario.",
          image: "/images/hero/image3.jpg", 
          imageAlt: "Compras de moda",
          backgroundColor: "#C89F7E", 
          cta: {
            primary: { text: "Ver Ofertas", href: "/products?filter=sale" },
            secondary: { text: "Ver Todo", href: "/products" },
          },
        },
      ],
    },


featureBadges: [
  {
    id: "badge-2",
    icon: "shield-check",
    title: "Gran Variedad",
    subtitle: "Encuentra todo en un solo lugar",
    color: "#4ECDC4",
  },


  {
    id: "badge-4",
    icon: "truck",
    title: "Envíos Rápidos",
    subtitle: "Recibe tu pedido sin demoras",
    color: "#A78BFA",
  },
],
  },

  marquee: {
    items: [
      "Envío Gratis en Pedidos Superiores a {0}",
      "Garantía de Devolución de 30 Días",
      "Soporte al Cliente 24/7",
      "Pago Seguro",
      "Descuentos Exclusivos para Miembros",
    ],
    speed:6,
    pauseOnHover: true,
  },

  benefits: [
    {
      icon: "truck",
      title: "Envío Gratis",
      description: "En pedidos superiores a {0}",
    },
    {
      icon: "shield-check",
      title: "Pago Seguro",
      description: "Transacciones 100% protegidas",
    },
    {
      icon: "refresh-cw",
      title: "Devoluciones Fáciles",
      description: "Política de devolución de 30 días",
    },
    {
      icon: "headphones",
      title: "Soporte 24/7",
      description: "Servicio al cliente dedicado",
    },
  ],

  trending: {
    title: "Tendencias",
    subtitle: "Productos más populares de la semana",
    limit: 15,
    viewAllHref: "/products?sort=trending",
  },

  categories: [
    {
      id: "electronics",
      name: "Electrónica",
      image: "/category/electronics.jpg",
      href: "/products?category=electronics",
      description: "Última tecnología y gadgets",
    },
    {
      id: "fashion",
      name: "Moda",
      image: "/category/fashion.jpg",
      href: "/products?category=fashion",
      description: "Estilo para cada ocasión",
    },
    {
      id: "home",
      name: "Hogar y Vida",
      image: "/category/home.jpg",
      href: "/products?category=home",
      description: "Transforma tu espacio",
    },
    {
      id: "sports",
      name: "Deportes y Aire Libre",
      image: "/category/sports.jpg",
      href: "/products?category=sports",
      description: "Prepárate para la aventura",
    },
  ],

  offers: {
    title: "Ofertas Especiales",
    subtitle: "Ofertas por tiempo limitado que no querrás perderte",
    badge: "OFERTA",
  },

  newArrivals: {
    title: "Nuevas Llegadas",
    subtitle: "Selecciones frescas solo para ti",
    limit: 12,
    viewAllHref: "/products?sort=newest",
  },

  testimonials: {
    title: "Lo Que Dicen Nuestros Clientes",
    items: [
      {
        id: 1,
        name: "Sarah Johnson",
        role: "Comprador Verificado",
        avatar: "/testimonials/avatar-1.jpg",
        rating: 5,
        text: "Absolutamente amo la calidad y el envío rápido. ¡Definitivamente ordenaré de nuevo!",
      },
      {
        id: 2,
        name: "Michael Chen",
        role: "Comprador Verificado",
        avatar: "/testimonials/avatar-2.jpg",
        rating: 5,
        text: "Excelente servicio al cliente y productos increíbles. ¡Muy recomendado!",
      },
      {
        id: 3,
        name: "Emily Rodriguez",
        role: "Comprador Verificado",
        avatar: "/testimonials/avatar-3.jpg",
        rating: 5,
        text: "La mejor experiencia de compra en línea que he tenido. ¡Gran selección y precios!",
      },
    ],
  },

  trustBadges: {
    title: "Compra con Confianza",
    badges: [
      { icon: "lock", text: "Compra Segura" },
      { icon: "award", text: "Calidad Garantizada" },
      { icon: "users", text: "Confiado por 10,000+" },
    ],
  },

  paymentMethods: {
    title: "Aceptamos",
    methods: ["visa", "mastercard", "amex", "paypal", "apple-pay", "google-pay"],
  },

  stickyNewsletter: {
    triggerScrollPercentage: 80,
    title: "¡No te lo Pierdas!",
    description: "Recibe ofertas exclusivas en tu bandeja de entrada",
    placeholder: "Ingresa tu correo",
    buttonText: "Registrarse",
  },
};
