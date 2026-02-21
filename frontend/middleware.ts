import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Handle authentication for protected routes
  if (request.nextUrl.pathname.startsWith('/app')) {
    const token = request.cookies.get('todo_jwt_token')?.value

    if (!token) {
      const loginUrl = new URL('/login', request.url)
      return NextResponse.redirect(loginUrl)
    }
  }

  // Proxy API requests to the backend server
  if (request.nextUrl.pathname.startsWith('/api/')) {
    // Construct the backend URL
    const backendUrl = `http://localhost:8000${request.nextUrl.pathname}${request.nextUrl.search}`;

    return NextResponse.rewrite(backendUrl);
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
