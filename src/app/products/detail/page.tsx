"use client"

import { Suspense } from "react"
import { ProductDetailClient } from "../[slug]/ProductDetailClient"

export default function ProductDetailPage() {
    return (
        <Suspense fallback={<div>Cargando...</div>}>
            <ProductDetailClient slug="" />
        </Suspense>
    )
}
