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
            Authorization: `Bearer ${token}`,
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
        throw new Error("Session expired. Please login again.");
    }

    if (response.status === 403) {
        throw new Error("Access denied. Please login again.");
    }

    if (!response.ok) {
        throw new Error("Something went wrong.");
    }

    return response;
}