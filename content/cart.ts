export const cart = {
  title: "Carrito de Compras",
  
  stepper: {
    steps: [
      { id: 1, label: "Carrito", key: "cart" },
      { id: 2, label: "Datos", key: "data" },
      { id: 3, label: "Envío", key: "delivery" },
      { id: 4, label: "Pago", key: "payment" },
    ],
  },

  step1: {
    title: "Revisa tu Carrito",
    emptyCart: "Tu carrito está vacío",
    continueShopping: "Continuar Comprando",
    updateQty: "Actualizar cantidad",
    removeItem: "Eliminar",
    
    coupon: {
      label: "¿Tienes un cupón?",
      placeholder: "Ingresa el código",
      apply: "Aplicar",
      applying: "Aplicando...",
      success: "Cupón aplicado exitosamente",
      invalid: "Código inválido o expirado",
      remove: "Eliminar cupón",
    },
    
    summary: {
      titulo: "Resumen del pedido",
      subtotal: "Subtotal",
      discount: "Descuento",
      shipping: "Envío",
      tax: "Impuestos",
      total: "Total",
      proceedToCheckout: "Proceder al Pago",
    },
  },

  step2: {
    title: "Tu Información",
    subtitle: "Necesitamos esta información para procesar tu pedido",
    
    guestOption: "Continuar como invitado",
    loginPrompt: "¿Ya tienes una cuenta?",
    loginLink: "Iniciar sesión",
    
    fields: {
      email: { label: "Correo Electrónico", placeholder: "tu@correo.com", required: true },
      firstName: { label: "Nombre", placeholder: "Juan", required: true },
      lastName: { label: "Apellido", placeholder: "Pérez", required: true },
      phone: { label: "Teléfono", placeholder: "+54 (555) 000-0000", required: true },
    },
    
    createAccount: "Crear una cuenta para un pago más rápido la próxima vez",
    continueButton: "Continuar al Envío",
  },

  step3: {
    title: "Método de Envío",
    
    methods: {
      pickup: {
        label: "Retiro en Tienda",
        description: "Selecciona una sucursal para retirar tu pedido",
        selectBranch: "Seleccionar Sucursal",
        findNearest: "Buscar Cercana",
        free: "Gratis",
      },
      shipping: {
        label: "Envío a Domicilio",
        description: "Enviaremos a tu dirección",
        selectAddress: "Seleccionar Dirección",
        addNew: "Agregar Nueva Dirección",
        calculating: "Calculando costo de envío...",
      },
    },
    
    addressFields: {
      street: { label: "Dirección", placeholder: "Calle 123", required: true },
      city: { label: "Ciudad", placeholder: "Ciudad", required: true },
      state: { label: "Estado/Provincia", placeholder: "Estado", required: true },
      zip: { label: "Código Postal", placeholder: "12345", required: true },
      notes: { label: "Notas de Envío", placeholder: "Instrucciones opcionales", required: false },
    },
    
    continueButton: "Continuar al Pago",
  },

  step4: {
    title: "Revisar y Pagar",
    subtitle: "Por favor revisa tu pedido antes de completar",
    
    orderSummary: "Resumen del Pedido",
    deliveryInfo: "Información de Envío",
    paymentMethod: "Método de Pago",
    
    pickup: "Retiro en:",
    shipping: "Envío a:",
    
    placeOrder: "Realizar Pedido",
    placingOrder: "Procesando...",
    
    termsAccept: "Al realizar este pedido, aceptas nuestros",
    termsLink: "Términos y Condiciones",
    and: "y",
    privacyLink: "Política de Privacidad",
  },

  success: {
    title: "¡Pedido Realizado con Éxito!",
    subtitle: "Gracias por tu compra",
    orderNumber: "Número de Pedido",
    downloadReceipt: "Descargar Recibo",
    viewOrder: "Ver Detalles del Pedido",
    continueShopping: "Continuar Comprando",
    emailSent: "Se ha enviado un correo de confirmación a",
  },

  errors: {
    generic: "Algo salió mal. Por favor intenta de nuevo.",
    preview: "No se pudo calcular el total del pedido",
    coupon: "Error al aplicar el cupón",
    shipping: "No se pudo calcular el costo de envío",
    create: "Error al crear el pedido",
    payment: "El procesamiento del pago falló",
    retry: "Reintentar",
  },
};
