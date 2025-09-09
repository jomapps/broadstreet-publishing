import { NextRequest, NextResponse } from 'next/server';

/**
 * Middleware to handle CORS for API routes
 * This runs before all API requests and adds appropriate CORS headers
 */
export function middleware(request: NextRequest) {
  // Only apply CORS to API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const origin = request.headers.get('origin');
    const allowedOrigins = process.env.CORS_ALLOWED_ORIGINS?.split(',').map(o => o.trim()) || [];
    
    // Handle preflight requests (OPTIONS)
    if (request.method === 'OPTIONS') {
      const headers: Record<string, string> = {
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
        'Access-Control-Max-Age': '86400',
      };

      // Set origin-specific headers
      if (origin && allowedOrigins.includes(origin)) {
        headers['Access-Control-Allow-Origin'] = origin;
        headers['Access-Control-Allow-Credentials'] = 'true';
      } else if (allowedOrigins.length === 0) {
        // Development mode - allow all origins
        headers['Access-Control-Allow-Origin'] = '*';
      }

      return new NextResponse(null, {
        status: 200,
        headers,
      });
    }

    // For non-preflight requests, continue to the API route
    // but add CORS headers to the response
    const response = NextResponse.next();
    
    // Add CORS headers
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    response.headers.set('Access-Control-Max-Age', '86400');
    
    // Set origin-specific headers
    if (origin && allowedOrigins.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Access-Control-Allow-Credentials', 'true');
    } else if (allowedOrigins.length === 0) {
      // Development mode - allow all origins
      response.headers.set('Access-Control-Allow-Origin', '*');
    }

    return response;
  }

  // For non-API routes, continue normally
  return NextResponse.next();
}

/**
 * Configure which paths the middleware should run on
 */
export const config = {
  matcher: [
    /*
     * Match all API routes
     * - /api/routes
     */
    '/api/:path*',
  ],
};