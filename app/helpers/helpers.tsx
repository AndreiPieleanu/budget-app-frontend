// All API calls go to this app's own origin. proxy.ts forwards /api/* to the backend, so the auth cookie
// (HttpOnly, set by the backend) is a first-party cookie: scripts can't read it and browsers that block
// third-party cookies still send it.
export const API = "/api";

// Earlier versions kept the JWT in localStorage. Remove any leftover copy so it can't be read by scripts.
if (typeof window !== "undefined") {
    localStorage.removeItem("token");
}

export async function authFetch(
    url: string,
    options: {
        method?: string;
        body?: any;
        headers?: Record<string, string>;
    } = {}
) {
    const config: RequestInit = {
        method: options.method || "GET",
        credentials: "same-origin",
        headers: {
            ...(options.headers || {}),
        },
    };

    if (options.body) {
        config.body = JSON.stringify(options.body);
        (config.headers as Record<string, string>)["Content-Type"] = "application/json";
    }

    const response = await fetch(`${API}/${url}`, config);

    // Session missing, expired or revoked.
    if (response.status === 401) {
        notifyAuthChanged();
        if (typeof window !== "undefined") {
            window.location.href = "/login";
        }
        throw new Error("Session expired. Please login again.");
    }

    if (response.status === 403) {
        notifyAuthChanged();
        if (typeof window !== "undefined") {
            window.location.href = "/login";
        }
        throw new Error("Access denied. Please login again.");
    }

    if (!response.ok) {
        throw new Error("Something went wrong.");
    }

    return response;
}

// Asks the backend who is logged in. The token itself is in an HttpOnly cookie, so the browser can't
// read it; the backend verifies the cookie and returns the user id, or 403 when there is no valid session.
export async function getCurrentUserId(): Promise<number | null> {
    try {
        const res = await fetch(`${API}/auth/me`, { method: "POST", credentials: "same-origin" });
        if (!res.ok) return null;
        const id = await res.json();
        return Number.isInteger(id) ? id : null;
    } catch {
        return null;
    }
}

export async function isLoggedIn(): Promise<boolean> {
    return (await getCurrentUserId()) !== null;
}

// Revokes the session on the server and clears the cookie.
export async function logout(): Promise<void> {
    try {
        await fetch(`${API}/auth/logout`, { method: "POST", credentials: "same-origin" });
    } finally {
        notifyAuthChanged();
    }
}

export function notifyAuthChanged() {
    if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("authChanged"));
    }
}
