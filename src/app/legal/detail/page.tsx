"use client"

import { Suspense } from "react"
import { LegalClient } from "../[slug]/LegalClient"

export default function LegalDetailPage() {
    return (
        <Suspense fallback={<div>Cargando...</div>}>
            <LegalClient slug="" />
        </Suspense>
    )
}
