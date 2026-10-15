import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  // 1. Session Refresh via Supabase
  const { supabaseResponse } = await updateSession(request);

  // 2. Subdomain Routing: app. vs root
  const host = request.headers.get('host') || '';
  const url = request.nextUrl.clone();

  const isAppSubdomain = host.startsWith('app.');

  if (isAppSubdomain) {
    // If user hits app root "app.domain.com/", route them to "/events/new"
    if (url.pathname === '/') {
      url.pathname = '/events/new';
      return NextResponse.rewrite(url);
    }
  }

  return supabaseResponse;
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
