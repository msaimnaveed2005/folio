const API_URL = "http://localhost:3000/api/books";

/**
 * Shared fetch helper for book endpoints.
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
        throw new Error(data.message || "Failed to complete book request");
    }

    return data;
}

/**
 * Upload an EPUB file (uses FormData).
 */
export function uploadBookFile(file, token) {
    const formData = new FormData();
    formData.append("file", file);

    return request("/upload", {
        method: "POST",
        body: formData,
        token,
        isFormData: true,
    });
}

/**
 * Fetch all books belonging to the authenticated reader.
 */
export function fetchUserBooks(token) {
    return request("/", {
        method: "GET",
        token,
    });
}

/**
 * Fetch details for a specific book including its table of contents.
 */
export function fetchBookDetails(bookId, token) {
    return request(`/${bookId}`, {
        method: "GET",
        token,
    });
}

/**
 * Fetch a specific chapter's reading text.
 */
export function fetchChapterContent(bookId, chapterId, token) {
    return request(`/${bookId}/chapters/${chapterId}`, {
        method: "GET",
        token,
    });
}

/**
 * Delete a book from the library.
 */
export function deleteBookById(bookId, token) {
    return request(`/${bookId}`, {
        method: "DELETE",
        token,
    });
}