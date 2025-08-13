// import { NextResponse } from 'next/server';
// import type { NextRequest } from 'next/server';

// export function middleware(request: NextRequest) {
//   const token = request.cookies.get('access_token')?.value;
//   const { pathname } = request.nextUrl;

//   console.log('Middleware hit:', pathname, 'token:', token ? 'YES' : 'NO');

//   const publicRoutes = ['/', '/login', '/register'];
//   const isPublicRoute = publicRoutes.includes(pathname);

//   if (token && (pathname === '/login' || pathname === '/register')) {
//     console.log('Redirect logged-in user from login/register to /dashboard');
//     return NextResponse.redirect(new URL('/dashboard', request.url));
//   }

//   if (!token && !isPublicRoute) {
//     console.log('Redirect unauthenticated user to /login');
//     return NextResponse.redirect(new URL('/login', request.url));
//   }

//   console.log('Allowing request to continue');
//   return NextResponse.next();
// }

// export const config = {
//   matcher: [
//     '/((?!api|_next|favicon.ico|images|fonts).*)',
//   ],
// };


import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Helper function to check if user is authenticated based on cookies
function isAuthenticated(request: NextRequest): boolean {
  const isAuth = request.cookies.get('is_authenticated');
  const accessToken = request.cookies.get('access_token');
  
  return isAuth?.value === 'true' && !!accessToken?.value;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuth = isAuthenticated(request);

  // Define protected and public routes
  const protectedRoutes = ['/dashboard', '/expenses', '/groups', '/profile', '/settings'];
  const authRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];
  
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );
  const isAuthRoute = authRoutes.some(route => 
    pathname.startsWith(route)
  );

  // Redirect authenticated users away from auth pages
  if (isAuth && isAuthRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Redirect unauthenticated users to login
  if (!isAuth && isProtectedRoute) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Allow the request to proceed
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};