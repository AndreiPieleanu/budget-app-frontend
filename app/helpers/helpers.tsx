const API = process.env.NEXT_PUBLIC_API_URL;

export async function authFetch(
    url: string,
    options: {
        method?: string;
        body?: any;
        headers?: Record<string, string>;
    } = {}
) {
    const token = localStorage.getItem("token");

    const config: RequestInit = {
        method: options.method || "GET",
        headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...(options.headers || {}),
        },
    };

    if (options.body) {
        config.body = JSON.stringify(options.body);
        (config.headers as Record<string, string>)["Content-Type"] = "application/json";
    }

    const response = await fetch(`${API}/${url}`, config);

    // token expired / unauthorized
    if (response.status === 401) {
        localStorage.removeItem("token");
        if (typeof window !== "undefined") {
            window.location.href = "/login";
        }
        throw new Error("Session expired. Please login again.");
    }

    if (response.status === 403) {
        localStorage.removeItem("token");
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

// Reads the user ID from the stored JWT's payload (the backend puts it in the
// "userId" claim). Used only to build request paths: the backend still verifies
// the token's signature and checks that the ID matches it.
export function getCurrentUserId(): number | null {
    const token = localStorage.getItem("token");
    if (!token) return null;
    try {
        const payload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
        const { userId } = JSON.parse(atob(payload));
        return Number.isInteger(userId) ? userId : null;
    } catch {
        return null;
    }
}

export async function createLog(
    message: string,
) {
    await authFetch("logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: {
            message,
        },
    });
}