# Frontend B2C - E-commerce Platform

This is the front-facing client application for the E-commerce ecosystem, an enterprise-grade web application built with **Next.js**, **React Query**, and **Tailwind CSS**.

## 🌟 Core Features

- **Smart Catalog**: Real-time search, dynamic filtering (categories, brands, prices), and smooth iteration.
- **Premium Product Pages**: Image galleries, variant selection (size/color), review system, and cross-selling engine ("frequently bought together").
- **Frictionless Checkout**: Automated shipping calculation based on distance (store geolocation), and a 100% integrated payment flow with real gateways.
- **Corporate User Portal**: Complete order history, PDF invoice generation and downloading, favorites list, and integrated live support chat.
- **Smart Multi-currency & Geo-Adaptation**: Real-time country detection and pricing conversion to operate globally, transparent to the user.
- **Integrated CMS Module**: SEO-friendly Blog and dynamic FAQ system, manageable from the Admin Panel.
- **Zero-Trust Security Client**: Re-validates carts strictly against the backend to prevent bypass attacks.

## 🛠️ Technology Stack

- **Framework**: Next.js 14 (App Router, SSR & SSG)
- **Styling**: Tailwind CSS & Lucide React
- **Data Management**: TanStack Query (React Query)
- **Animations**: Framer Motion
- **Global State**: Zustand (Cart, Favorites, UI Context)
- **Communication**: Axios (with custom interceptors)
- **Real-time**: Socket.io-client (Live Chat)

## 📦 Setup & Development

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation
```bash
npm install
```

### Run Locally
```bash
npm run dev
```
The development server will be available at [http://localhost:3000](http://localhost:3000).

## 📁 Project Structure

- `src/app`: Application routes, pages, and layouts (App Router).
- `src/components`: Reusable components organized by feature.
- `src/services`: API adapters for backend communication.
- `src/store`: Global state definitions (Zustand).
- `src/hooks`: Custom React hooks.
- `src/types`: TypeScript definitions.

---
© 2026 Proprietary Software. All rights reserved.
