import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

const AUTH_PAGES = ['/login', '/register', '/forgot-password', '/reset-password'];
// Caregiver share-link pages (/caregiver/<token>) are publicly accessible
// to anyone with the link, regardless of sign-in state.
const SHARE_LINK_RE = /^\/caregiver\/[^/]+$/;

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isAuthPage = AUTH_PAGES.some((p) => pathname.startsWith(p));
  const isShareLink = SHARE_LINK_RE.test(pathname);
  const isLoggedIn = !!req.auth;

  if (!isLoggedIn && !isAuthPage && !isShareLink) {
    const url = new URL('/login', req.nextUrl.origin);
    return NextResponse.redirect(url);
  }
  if (isLoggedIn && isAuthPage) {
    const url = new URL('/dashboard', req.nextUrl.origin);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
