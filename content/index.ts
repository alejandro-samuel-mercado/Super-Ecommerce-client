
export const forms = {
  validation: {
    required: "Este campo es obligatorio",
    email: "Por favor ingresa un correo válido",
    min: (min: number) => `Mínimo ${min} caracteres requeridos`,
    max: (max: number) => `Máximo ${max} caracteres permitidos`,
  },
  placeholders: {
    email: "nombre@ejemplo.com",
    password: "••••••••",
    search: "Buscar...",
  },
  buttons: {
    submit: "Enviar",
    loading: "Por favor espere...",
  },
};

export const errors = {
  general: "Algo salió mal. Por favor intenta de nuevo.",
  network: "Error de red. Por favor verifica tu conexión.",
  unauthorized: "Por favor inicia sesión para continuar.",
  notFound: "Página no encontrada.",
};

export const legal = {
  terms: "terms_key", 
  privacy: "privacy_key",
};

export const products = {
  filterLabels: {
    category: "Categoría",
    price: "Rango de Precio",
    sort: "Ordenar Por",
  },
  priceRanges: [
    { label: "Menos de $50", min: 0, max: 50 },
    { label: "$50 - $100", min: 50, max: 100 },
    { label: "$100 - $200", min: 100, max: 200 },
    { label: "Más de $200", min: 200, max: null },
  ],
};
