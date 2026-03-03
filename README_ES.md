# Frontend B2C - Plataforma E-commerce

Este es el proyecto frontend (cliente final) para el ecosistema E-commerce, una aplicación web de nivel corporativo construida con **Next.js**, **React Query** y **Tailwind CSS**.

## 🌟 Características Principales

- **Catálogo Inteligente**: Filtros dinámicos (categorías, marcas, precios), búsqueda en tiempo real e iteración fluida.
- **Ficha de Producto Premium**: Galería de imágenes, selección de variantes (talles/colores), sistema de reviews, y motor de productos recomendados ("comprados juntos").
- **Checkout Sin Fricción**: Cálculo automático de envío por distancia (geolocalización de sucursales) y proceso de pago 100% integrado a pasarelas reales.
- **Portal de Usuario Corporativo**: Historial de órdenes, generador y descarga de facturas en PDF, lista de favoritos, y chat de soporte en vivo.
- **Multimoneda y Geo-Adaptación Inteligente**: Detección del país del usuario y conversión de precios en tiempo real para operar a nivel internacional, de manera transparente.
- **Módulo CMS Externo**: Blog SEO-friendly integrado y sistema de FAQs, alimentado directamente desde el panel administrador.
- **Cliente de Seguridad Zero-Trust**: Sistema que asume que el carrito puede ser manipulado en el DOM, pre-validando todo siempre con el servidor.

## 🛠️ Tecnologías Utilizadas

- **Framework**: Next.js 14 (App Router, SSR y SSG)
- **Estilos**: Tailwind CSS & Lucide React
- **Gestión de Datos**: TanStack Query (React Query)
- **Animaciones**: Framer Motion
- **Estado Global**: Zustand (Carrito, Favoritos, Contexto UI)
- **Comunicación**: Axios (vía adaptador http personalizado con interceptores)
- **Tiempo Real**: Socket.io-client (Chat de soporte)

## 📦 Configuración y Desarrollo

### Requisitos Previos
- Node.js (v18 o superior)
- npm o yarn

### Instalación
```bash
npm install
```

### Ejecutar Localmente
```bash
npm run dev
```
El servidor de desarrollo estará disponible en [http://localhost:3000](http://localhost:3000).

## 📁 Estructura del Proyecto

- `src/app`: Páginas y layouts de la aplicación (App Router).
- `src/components`: Componentes reutilizables organizados por características.
- `src/services`: Adaptadores para la comunicación con el backend.
- `src/store`: Definiciones de estado global (Zustand).
- `src/hooks`: Hooks personalizados para lógica compartida.
- `src/types`: Definiciones de tipos TypeScript.

---
© 2026 Software Propietario. Todos los derechos reservados.
