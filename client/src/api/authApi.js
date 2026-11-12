const API_URL = "http://localhost:3000/api/auth";

/**
 * Shared fetch helper for all auth endpoints.
 * Always passes `credentials: "include"` so HttpOnly refresh cookies
 * work between http://localhost:5173 (client) and http://localhost:3000 (server).
 */
async function request(endpoint, { method = "GET", body, token } = {}) {
    const headers = {};

    if (body) {
        headers["Content-Type"] = "application/json";
    }

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
        method,
        headers,
        credentials: "include",
        body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
    }

    return data;
}

export function registerUser({ username, email, password }) {
    return request("/register", {
        method: "POST",
        body: { username, email, password },
    });
}

export function verifyEmail({ email, otp }) {
    return request("/verify-email", {
        method: "POST",
        body: { email, otp },
    });
}

export function loginUser({ email, password }) {
    return request("/login", {
        method: "POST",
        body: { email, password },
    });
}

export function getMe(token) {
    return request("/get-me", {
        method: "GET",
        token,
    });
}

export function refreshAccessToken() {
    return request("/refresh-token", {
        method: "GET",
    });
}

export function logoutUser() {
    return request("/logout", {
        method: "GET",
    });
}

export function logoutAllDevices() {
    return request("/logout-all", {
        method: "GET",
    });
}