import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // Capturar el país detectado por Vercel
  const country = request.headers.get('x-vercel-ip-country');
  
  if (country) {
    // Guardar en una cookie para que el cliente pueda leerla y enviarla a la API
    // Usamos una cookie con Max-Age largo (1 año) para persistencia
    response.cookies.set('vercel-country', country, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      sameSite: 'lax',
    });
  }

  return response;
}

// Opcional: Solo ejecutar en rutas que necesiten detección o en toda la app
export const config = {
  matcher: '/((?!api|_next/static|_next/image|favicon.ico).*)',
};
