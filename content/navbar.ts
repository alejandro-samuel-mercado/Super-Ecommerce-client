export const navbar = {
  logo: {
    src: "/logo.svg",
    alt: "Tienda",
    text: "LOGO TIENDA",
  },
  search: {
    placeholder: "Buscar productos, marcas, SKU...",
    sitewideLimit: 5,
  },
  categories: [
    {
      id: "computacion",
      label: "Computación",
      href: "/products?category=computacion",
      megaMenu: {
        featured: {
          title: "Setup Gamer",
          image: "/featured/setup.jpg",
          description: "Arma tu PC ideal",
          cta: { text: "Ver Todo", href: "/products?category=computacion" },
        },
        columns: [
          {
            title: "Componentes",
            items: [
              { label: "Todo Componentes", href: "/products?category=computacion&subcategoria=componentes-pc" },
              { label: "Tarjetas Gráficas", href: "/products?category=computacion&subcategoria=tarjetas-graficas" },
              { label: "Nvidia Serie 4000", href: "/products?category=computacion&subcategoria=nvidia-4000" },
            ],
          },
        ],
      },
    },
    {
      id: "electronics",
      label: "Electrónica",
      href: "/products?category=electronics",
      megaMenu: {
        featured: {
          title: "Destacados",
          image: "/featured/electronics.jpg",
          description: "Electrónica mejor calificada para ti",
          cta: { text: "Comprar Ahora", href: "/products?category=electronics&tendencia=true" },
        },
        columns: [
          {
            title: "Computadoras",
            items: [
              { label: "Laptops", href: "/products?category=electronics&subcategoria=laptops" },
              { label: "Computadoras de Escritorio", href: "/products?category=electronics&subcategoria=desktops" },
              { label: "Tablets", href: "/products?category=electronics&subcategoria=tablets" },
            ],
          },
          {
            title: "Audio",
            items: [
              { label: "Auriculares", href: "/products?category=electronics&subcategoria=headphones" },
              { label: "Altavoces", href: "/products?category=electronics&subcategoria=speakers" },
            ],
          },
        ],
      },
    },
    {
      id: "fashion",
      label: "Moda",
      href: "/products?category=fashion",
      megaMenu: {
        featured: {
          title: "Nuevas Llegadas",
          image: "/featured/fashion.jpg",
          description: "Estilos frescos para la temporada",
          cta: { text: "Explorar", href: "/products?category=fashion&sort=newest" },
        },
        columns: [
          {
            title: "Hombres",
            items: [
              { label: "Camisas", href: "/products?category=fashion&subcategoria=men-shirts" },
              { label: "Pantalones", href: "/products?category=fashion&subcategoria=men-pants" },
            ],
          },
          {
            title: "Mujeres",
            items: [
              { label: "Vestidos", href: "/products?category=fashion&subcategoria=women-dresses" },
              { label: "Tops", href: "/products?category=fashion&subcategoria=women-tops" },
            ],
          },
        ],
      },
    },
    {
      id: "home",
      label: "Hogar y Vida",
      href: "/products?category=home",
    },
  ],
  icons: {
    account: {
      label: "Cuenta",
      authHref: "/profile",
      noAuthAction: "modal",
    },
    cart: {
      label: "Carrito",
      action: "drawer",
    },
    wishlist: {
      label: "Lista de Deseos",
      href: "/wishlist",
    },
  },
};
