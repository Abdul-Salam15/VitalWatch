import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

const PUBLIC_PATHS = ['/login', '/register'];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));
  const isLoggedIn = !!req.auth;

  if (!isLoggedIn && !isPublic) {
    const url = new URL('/login', req.nextUrl.origin);
    return NextResponse.redirect(url);
  }
  if (isLoggedIn && isPublic) {
    const url = new URL('/dashboard', req.nextUrl.origin);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
