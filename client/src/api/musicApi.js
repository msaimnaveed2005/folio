const API_URL = "http://localhost:3000/api/music";

/**
 * Shared fetch helper for reading music endpoints.
 * Automatically injects the in-memory Bearer token.
 */
async function request(endpoint, { method = "GET", body, token, isFormData = false } = {}) {
    const headers = {};

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    if (body && !isFormData) {
        headers["Content-Type"] = "application/json";
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
        method,
        headers,
        credentials: "include",
        body: isFormData ? body : body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data.message || "Failed to complete music request");
    }

    return data;
}

/**
 * Fetch all custom tracks uploaded by the authenticated reader.
 */
export function fetchUserTracks(token) {
    return request("/", {
        method: "GET",
        token,
    });
}

/**
 * Upload an audio file (.mp3, .wav, .ogg, .m4a) using FormData field "audio".
 */
export function uploadTrackFile(file, title, token) {
    const formData = new FormData();
    formData.append("audio", file);
    if (title?.trim()) {
        formData.append("title", title.trim());
    }

    return request("/upload", {
        method: "POST",
        body: formData,
        token,
        isFormData: true,
    });
}

/**
 * Stream a protected track with Bearer auth and return a playable local Blob URL.
 * Call URL.revokeObjectURL(url) when switching tracks or unmounting to free memory.
 */
export async function fetchTrackBlobUrl(trackId, token, signal) {
    const response = await fetch(`${API_URL}/${trackId}/stream`, {
        method: "GET",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: "include",
        signal,
    });

    if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "Failed to stream audio track");
    }

    const blob = await response.blob();
    return URL.createObjectURL(blob);
}

/**
 * Delete a custom track from the reader's library.
 */
export function deleteTrackById(trackId, token) {
    return request(`/${trackId}`, {
        method: "DELETE",
        token,
    });
}
