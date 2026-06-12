import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_PATHS = ['/', '/_next', '/manifest.json', '/sw.js']
const STATIC_EXTENSIONS = /\.(ico|png|svg|jpg|jpeg|gif|woff|woff2|ttf|css|js|xml|txt)$/
const KNOWN_PATHS = ['/', '/dashboard', '/transactions', '/goals', '/budgets', '/settings', '/auth/login', '/auth/register']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('spendwise-token')?.value

  // Allow static assets and Next.js internals
  if (STATIC_EXTENSIONS.test(pathname) || pathname.startsWith('/_next') || pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  // Public paths — allow unauthenticated access
  if (PUBLIC_PATHS.includes(pathname)) {
    // If authenticated and on landing page, redirect to dashboard
    if (token && pathname === '/') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return NextResponse.next()
  }

  // Known app paths — redirect unauthenticated to landing page
  if (KNOWN_PATHS.includes(pathname)) {
    if (!token) {
      return NextResponse.redirect(new URL('/', request.url))
    }
    return NextResponse.next()
  }

  // Unknown paths — redirect based on auth status
  if (token) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  return NextResponse.redirect(new URL('/', request.url))
}

export const config = {
  matcher: '/((?!api/|_next/|_static/|_vercel|[\\w-]+\\.\\w+).*)',
}
