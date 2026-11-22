import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Where /api/* is forwarded to. BACKEND_URL is server-only; NEXT_PUBLIC_API_URL is the older name, kept as a fallback.
function backendUrl(): string {
    return (process.env.BACKEND_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/+$/, "");
}

// How many reverse proxies you control sit in front of this app and append the caller's address to
// X-Forwarded-For: 1 on Vercel or behind one nginx/Caddy/load balancer, 0 when Next is reached directly.
const TRUSTED_PROXY_HOPS = Math.max(0, Number.parseInt(process.env.TRUSTED_PROXY_HOPS ?? "0", 10) || 0);
const IP_PATTERN = /^[0-9A-Fa-f:.]{2,45}$/;

// The visitor's IP, or null when it can't be known reliably.
// A client can put anything at the start of X-Forwarded-For; only the entries appended by our own proxies
// (the last TRUSTED_PROXY_HOPS of them) are trustworthy, so the client's address is the Nth from the right.
// With 0 hops Next is exposed directly and only fills the header in when the client didn't send one, so
// nothing in it can be trusted: no IP is forwarded and the backend rate-limits by this server's address.
function trustedClientIp(request: NextRequest): string | null {
    if (TRUSTED_PROXY_HOPS === 0) return null;
    const entries = (request.headers.get("x-forwarded-for") ?? "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    const ip = entries[entries.length - TRUSTED_PROXY_HOPS];
    return ip && IP_PATTERN.test(ip) ? ip : null;
}

// Forwards /api/<path> to <backend>/<path>. The browser only ever talks to this origin, so the backend's
// HttpOnly session cookie is first-party (not blocked as a third-party cookie) and can't be read by scripts.
function forwardToBackend(request: NextRequest): NextResponse {
    const backend = backendUrl();
    if (!backend) {
        return new NextResponse("Backend URL is not configured", { status: 500 });
    }
    const path = request.nextUrl.pathname.replace(/^\/api/, "") || "/";
    const target = new URL(`${backend}${path}${request.nextUrl.search}`);

    const headers = new Headers(request.headers);
    // Never let a client supply these itself.
    headers.delete("x-client-ip");
    headers.delete("x-proxy-secret");
    // Nor any client-written address header: the backend (server.forward-headers-strategy) would otherwise take
    // a spoofed X-Forwarded-For as the caller's address, since this server sits on a trusted internal network.
    headers.delete("x-forwarded-for");
    headers.delete("x-real-ip");
    headers.delete("forwarded");

    // Every request now reaches the backend from this server, so pass on the visitor's IP for the backend's
    // rate limits. The shared secret lets the backend trust this header only when it really comes from this proxy.
    const secret = process.env.PROXY_SHARED_SECRET;
    const clientIp = trustedClientIp(request);
    if (clientIp) {
        headers.set("x-forwarded-for", clientIp);
    }
    if (secret && clientIp) {
        headers.set("x-client-ip", clientIp);
        headers.set("x-proxy-secret", secret);
    }

    return NextResponse.rewrite(target, { request: { headers } });
}

export function proxy(request: NextRequest) {
    if (request.nextUrl.pathname.startsWith("/api/")) {
        return forwardToBackend(request);
    }

    const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
    const isDev = process.env.NODE_ENV === "development";
    // Only ask the browser to upgrade requests to HTTPS when the page itself came over HTTPS; on a plain-HTTP
    // deployment the upgrade would point every asset at an HTTPS port that isn't there. Next fills in
    // x-forwarded-proto from the connection, and TLS-terminating proxies (Vercel, nginx) set it to https.
    const isHttps = (request.headers.get("x-forwarded-proto") ?? request.nextUrl.protocol.replace(":", ""))
        .split(",")[0].trim() === "https";

    // Scripts: only Next's own nonce-tagged scripts (and what they load) may run.
    // Styles: 'unsafe-inline' is needed for notistack and recharts inline styles.
    // connect-src 'self': the browser only calls this origin; /api/* is forwarded to the backend above.
    const csp = `
        default-src 'self';
        script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""};
        style-src 'self' 'unsafe-inline';
        img-src 'self' blob: data:;
        font-src 'self';
        connect-src 'self';
        object-src 'none';
        base-uri 'self';
        form-action 'self';
        frame-ancestors 'none';
        ${isHttps ? "upgrade-insecure-requests;" : ""}
    `.replace(/\s{2,}/g, " ").trim();

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-nonce", nonce);
    requestHeaders.set("Content-Security-Policy", csp);

    const response = NextResponse.next({ request: { headers: requestHeaders } });
    response.headers.set("Content-Security-Policy", csp);
    return response;
}

export const config = {
    matcher: [
        // API calls, forwarded to the backend.
        "/api/:path*",
        // Pages, which get the CSP nonce.
        {
            source: "/((?!api|_next/static|_next/image|favicon.ico).*)",
            missing: [
                { type: "header", key: "next-router-prefetch" },
                { type: "header", key: "purpose", value: "prefetch" },
            ],
        },
    ],
};
