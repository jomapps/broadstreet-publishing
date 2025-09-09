import { NextRequest, NextResponse } from 'next/server';

/**
 * CORS configuration utility for Next.js API routes
 * Reads allowed origins from environment variable CORS_ALLOWED_ORIGINS
 */
export function corsHeaders(origin?: string | null): Record<string, string> {
  const allowedOrigins = process.env.CORS_ALLOWED_ORIGINS?.split(',').map(o => o.trim()) || [];
  
  // Default headers
  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Max-Age': '86400', // 24 hours
  };

  // Check if origin is allowed
  if (origin && allowedOrigins.includes(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
    headers['Access-Control-Allow-Credentials'] = 'true';
  } else if (allowedOrigins.length === 0) {
    // If no origins configured, allow all (development mode)
    headers['Access-Control-Allow-Origin'] = '*';
  }

  return headers;
}

/**
 * Handle CORS preflight requests (OPTIONS)
 */
export function handleCors(request: NextRequest): NextResponse | null {
  const origin = request.headers.get('origin');
  
  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: corsHeaders(origin),
    });
  }

  return null;
}

/**
 * Add CORS headers to a response
 */
export function addCorsHeaders(response: NextResponse, origin?: string | null): NextResponse {
  const headers = corsHeaders(origin);
  
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

/**
 * Wrapper function to easily add CORS to any API route
 */
export function withCors(handler: (request: NextRequest) => Promise<NextResponse> | NextResponse) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const origin = request.headers.get('origin');
    
    // Handle preflight requests
    const corsResponse = handleCors(request);
    if (corsResponse) {
      return corsResponse;
    }

    // Execute the actual handler
    const response = await handler(request);
    
    // Add CORS headers to the response
    return addCorsHeaders(response, origin);
  };
}