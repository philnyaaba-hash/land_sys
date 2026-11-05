/** @type {import('next').NextConfig} */
const isProduction = process.env.NODE_ENV === 'production';
const secureTransport = isProduction && /^https:\/\//i.test(process.env.APP_URL || '');

const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "img-src 'self' data: blob:",
  "media-src 'self' blob:",
  "font-src 'self' data:",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  isProduction ? "script-src 'self' 'unsafe-inline'" : "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  isProduction ? "connect-src 'self'" : "connect-src 'self' ws: wss:",
  secureTransport ? 'upgrade-insecure-requests' : ''
].filter(Boolean).join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: contentSecurityPolicy },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(self), microphone=(), geolocation=(), payment=(), usb=()' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  { key: 'X-DNS-Prefetch-Control', value: 'off' }
];

if (secureTransport) {
  securityHeaders.push({ key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' });
}

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  distDir: process.env.NODE_ENV === 'development' ? '.next-dev' : '.next',
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  }
};
export default nextConfig;
