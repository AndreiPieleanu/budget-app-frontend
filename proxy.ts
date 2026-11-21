import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Where /api/* is forwarded to. BACKEND_URL is server-only; NEXT_PUBLIC_API_URL is the older name, kept as a fallback.
function backendUrl(): string {
    return (process.env.BACKEND_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/+$/, "");
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

    // Every request now reaches the backend from this server, so pass on the visitor's IP for the backend's
    // rate limits. On Vercel, x-forwarded-for is set by the platform and can't be spoofed by the client.
    // The shared secret lets the backend trust this header only when it really comes from this proxy.
    const secret = process.env.PROXY_SHARED_SECRET;
    const clientIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
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
        ${isDev ? "" : "upgrade-insecure-requests;"}
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
