import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Origin of the backend API, so the browser is allowed to call it (connect-src).
function apiOrigin(): string {
    try {
        return new URL(process.env.NEXT_PUBLIC_API_URL ?? "").origin;
    } catch {
        return "";
    }
}

export function proxy(request: NextRequest) {
    const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
    const isDev = process.env.NODE_ENV === "development";
    const api = apiOrigin();

    // Scripts: only Next's own nonce-tagged scripts (and what they load) may run.
    // Styles: 'unsafe-inline' is needed for notistack and recharts inline styles.
    const csp = `
        default-src 'self';
        script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""};
        style-src 'self' 'unsafe-inline';
        img-src 'self' blob: data:;
        font-src 'self';
        connect-src 'self' ${api};
        object-src 'none';
        base-uri 'self';
        form-action 'self';
        frame-ancestors 'none';
        ${api.startsWith("https://") ? "upgrade-insecure-requests;" : ""}
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
        {
            source: "/((?!api|_next/static|_next/image|favicon.ico).*)",
            missing: [
                { type: "header", key: "next-router-prefetch" },
                { type: "header", key: "purpose", value: "prefetch" },
            ],
        },
    ],
};
