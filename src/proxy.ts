import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_PATHS = ['/', '/_next', '/manifest.json', '/sw.js']
const STATIC_EXTENSIONS = /\.(ico|png|svg|jpg|jpeg|gif|woff|woff2|ttf|css|js|xml|txt)$/
const KNOWN_PATHS = ['/', '/dashboard', '/transactions', '/goals', '/budgets', '/settings']

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('spendwise-token')?.value

  if (STATIC_EXTENSIONS.test(pathname) || pathname.startsWith('/_next') || pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  if (PUBLIC_PATHS.includes(pathname)) {
    if (token && pathname === '/') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return NextResponse.next()
  }

  if (KNOWN_PATHS.includes(pathname)) {
    if (!token) {
      return NextResponse.redirect(new URL('/', request.url))
    }
    return NextResponse.next()
  }

  if (token) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  return NextResponse.redirect(new URL('/', request.url))
}

export const config = {
  matcher: '/((?!api/|_next/|_static/|_vercel|[\\w-]+\\.\\w+).*)',
}
