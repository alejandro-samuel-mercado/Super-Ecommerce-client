export const contact = {
  hero: {
    title: "Contáctanos",
    subtitle: "Nos encantaría saber de ti. Nuestro equipo está aquí para ayudar.",
  },

  branches: [
    {
      id: "downtown",
      name: "Sucursal Centro",
      address: "Calle Principal 123",
      city: "Ciudad",
      state: "Provincia",
      zip: "12345",
      country: "Argentina",
      phone: "+54 (555) 123-4567",
      email: "centro@tienda.com",
      hours: "Lun-Vie: 9AM-8PM, Sab: 10AM-6PM, Dom: 12PM-5PM",
      coordinates: {
        lat: 40.7128,
        lng: -74.006,
      },
    },
    {
      id: "uptown",
      name: "Sucursal Norte",
      address: "Avenida del Parque 456",
      city: "Ciudad",
      state: "Provincia",
      zip: "12346",
      country: "Argentina",
      phone: "+54 (555) 765-4321",
      email: "norte@tienda.com",
      hours: "Lun-Vie: 10AM-7PM, Sab: 10AM-6PM, Dom: Cerrado",
      coordinates: {
        lat: 40.7589,
        lng: -73.9851,
      },
    },
  ],

  form: {
    title: "Envíanos un mensaje",
    fields: {
      name: {
        label: "Nombre Completo",
        placeholder: "Juan Pérez",
        required: true,
      },
      email: {
        label: "Correo Electrónico",
        placeholder: "juan@ejemplo.com",
        required: true,
      },
      phone: {
        label: "Teléfono",
        placeholder: "+54 (555) 000-0000",
        required: false,
      },
      subject: {
        label: "Asunto",
        placeholder: "¿Cómo podemos ayudarte?",
        required: true,
      },
      message: {
        label: "Mensaje",
        placeholder: "Cuéntanos más sobre tu consulta...",
        required: true,
        rows: 6,
      },
    },
    submitButton: "Enviar Mensaje",
    submittingButton: "Enviando...",
    successMessage: "¡Gracias! Te responderemos pronto.",
    errorMessage: "Algo salió mal. Por favor intenta de nuevo.",
  },

  map: {
    title: "Encuéntranos",
    findNearestButton: "Buscar Sucursal Más Cercana",
    viewOnMapButton: "Ver en Mapa",
    getDirectionsButton: "Obtener Direcciones",
  },

  banners: [
    {
      title: "Soporte al Cliente 24/7",
      description: "Nuestro equipo siempre está aquí para ayudarte",
      icon: "headphones",
    },
    {
      title: "Tiempo de Respuesta Rápido",
      description: "Respondemos típicamente en 2 horas",
      icon: "clock",
    },
  ],
};
