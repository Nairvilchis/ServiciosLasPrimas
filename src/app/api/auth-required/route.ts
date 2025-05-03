import { NextResponse } from 'next/server';

export async function GET() {
  // Return a 401 Unauthorized responsesd
  return new NextResponse('Autenticación requerida', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Acceso restringido al área de administración"',
    },
  });
}

// Also handle POST or other methods if needed for completeness,
// although middleware typically rewrites GET requests for the prompt.
export async function POST() {
   return new NextResponse('Autenticación requerida', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Acceso restringido al área de administración"',
    },
  });
}
