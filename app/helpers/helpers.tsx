const API = "http://localhost:8080";

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

    return fetch(`${API}/${url}`, config);
}