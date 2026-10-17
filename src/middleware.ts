import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const host = request.headers.get('host') || '';
  const url = request.nextUrl.clone();
  const { pathname } = url;

  // Determine if this is an app subdomain request (e.g. app.secretsanta.io or app.localhost:3000)
  const appDomain = process.env.NEXT_PUBLIC_APP_DOMAIN || 'app.localhost:3000';
  const isAppSubdomain =
    host.startsWith('app.') ||
    host.includes('app.localhost') ||
    host === appDomain;

  // 1. App Subdomain Routing
  if (isAppSubdomain) {
    // If user navigates to the root of the app subdomain (app.domain.com/),
    // rewrite internally to the event creation wizard / organizer dashboard (/events/new)
    if (pathname === '/') {
      url.pathname = '/events/new';
      return NextResponse.rewrite(url);
    }
    return NextResponse.next();
  }

  // 2. Root Domain Routing (Marketing Site)
  // Root domain serves marketing landing page by default
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
