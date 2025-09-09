import { NextRequest, NextResponse } from 'next/server';

/**
 * Test endpoint to verify CORS configuration
 * GET /api/cors-test
 */
export async function GET(request: NextRequest) {
  const origin = request.headers.get('origin');
  const allowedOrigins = process.env.CORS_ALLOWED_ORIGINS?.split(',').map(o => o.trim()) || [];
  
  return NextResponse.json({
    message: 'CORS test endpoint',
    timestamp: new Date().toISOString(),
    requestOrigin: origin,
    allowedOrigins: allowedOrigins,
    corsConfigured: allowedOrigins.length > 0,
    originAllowed: origin ? allowedOrigins.includes(origin) : false,
  }, {
    status: 200,
  });
}

/**
 * Handle OPTIONS requests for CORS preflight
 * This is handled by middleware, but including for completeness
 */
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
  });
}