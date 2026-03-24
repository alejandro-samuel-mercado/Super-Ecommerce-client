"use client"

import { Suspense } from "react"
import { BlogPostClient } from "../[slug]/BlogPostClient"

export default function BlogDetailPage() {
    return (
        <Suspense fallback={<div>Cargando...</div>}>
            <BlogPostClient slug="" />
        </Suspense>
    )
}
