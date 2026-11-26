const API_URL = "http://localhost:3000/api/progress";

async function request(endpoint, { method = "GET", body, token } = {}) {
    const headers = {};

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    if (body) {
        headers["Content-Type"] = "application/json";
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
        method,
        headers,
        credentials: "include",
        body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data.message || "Failed to process reading progress");
    }

    return data;
}

export function fetchReadingProgress(bookId, token) {
    return request(`/${bookId}`, {
        method: "GET",
        token,
    });
}

export function saveReadingProgress(bookId, progressData, token) {
    return request(`/${bookId}`, {
        method: "PUT",
        body: progressData,
        token,
    });
}