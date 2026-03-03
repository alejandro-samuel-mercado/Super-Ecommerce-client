export const profile = {
  title: "Mi Cuenta",
  
  tabs: {
    profile: "Perfil",
    addresses: "Direcciones",
    orders: "Pedidos",
    favorites: "Favoritos",
    comments: "Reseñas",
    points: "Puntos e Historial",
  },

  profileEdit: {
    title: "Información Personal",
    fields: {
      firstName: { label: "Nombre", placeholder: "Juan" },
      lastName: { label: "Apellido", placeholder: "Pérez" },
      email: { label: "Correo Electrónico", readonly: true },
      phone: { label: "Teléfono", placeholder: "+54 (555) 000-0000" },
    },
    saveButton: "Guardar Cambios",
    savingButton: "Guardando...",
    successMessage: "Perfil actualizado exitosamente",
  },

  addresses: {
    title: "Mis Direcciones",
    addButton: "Agregar Nueva Dirección",
    editButton: "Editar",
    deleteButton: "Eliminar",
    setDefaultButton: "Establecer como Predeterminada",
    fields: {
      label: { label: "Etiqueta", placeholder: "Casa, Trabajo, etc." },
      street: { label: "Dirección", placeholder: "Calle 123" },
      city: { label: "Ciudad", placeholder: "Ciudad" },
      state: { label: "Estado", placeholder: "Estado" },
      zip: { label: "Código Postal", placeholder: "12345" },
      phone: { label: "Teléfono", placeholder: "+54 (555) 000-0000" },
    },
  },

  orders: {
    title: "Historial de Pedidos",
    noOrders: "Aún no hay pedidos",
    viewDetailsButton: "Ver Detalles",
    downloadButton: "Descargar Recibo",
    statuses: {
      PENDING: "Pendiente",
      PAID: "Pagado",
      SHIPPED: "Enviado",
      DELIVERED: "Entregado",
      CANCELLED: "Cancelado",
      PENDIENTE: "Pendiente",
      PAGADO: "Pagado",
      PENDIENTE_ENTREGA: "Pendiente de Entrega",
      EN_CAMINO: "En Camino",
      ENTREGADO: "Entregado",
      CANCELADO: "Cancelado",
      RECHAZADO: "Rechazado",
    },
  },

  favorites: {
    title: "Mis Favoritos",
    noFavorites: "Aún no hay favoritos",
    removeButton: "Eliminar",
  },

  comments: {
    title: "Mis Reseñas",
    noComments: "Aún no hay reseñas",
    writeReview: "Escribir una Reseña",
  },

  points: {
    title: "Puntos y Recompensas",
    currentBalance: "Saldo Actual",
    earned: "Ganados",
    used: "Usados",
    expired: "Expirados",
    history: "Historial de Puntos",
  },

  security: {
    logoutAllButton: "Cerrar Sesión en Todos los Dispositivos",
    logoutAllConfirm: "¿Estás seguro de que deseas cerrar sesión en todos los dispositivos?",
  },
};
