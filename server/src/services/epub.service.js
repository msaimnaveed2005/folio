import { EPub } from "epub2";

/**
 * Strips HTML tags to extract clean plain text for word counting and search.
 */
function stripHtmlTags(html) {
    if (!html) return "";
    return html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

/**
 * Sanitizes chapter HTML to prevent script injection (XSS) while preserving structure.
 */
function sanitizeHtml(html) {
    if (!html) return "";
    return html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
        .replace(/on\w+="[^"]*"/gi, "")
        .replace(/on\w+='[^']*'/gi, "");
}

/**
 * Extracts title from chapter HTML if not present in the EPUB spine manifest.
 */
function extractChapterTitle(html, fallbackIndex) {
    const headingMatch = html.match(/<h[1-3][^>]*>(.*?)<\/h[1-3]>/i);
    if (headingMatch && headingMatch[1]) {
        const cleanHeading = stripHtmlTags(headingMatch[1]);
        if (cleanHeading.length > 0 && cleanHeading.length < 100) {
            return cleanHeading;
        }
    }
    return `Chapter ${fallbackIndex + 1}`;
}

/**
 * Parses an EPUB file from disk, extracting metadata, cover image, and ordered chapters.
 */
export async function parseEpubFile(filePath) {
    const epub = await EPub.createAsync(filePath);

    // 1. Extract Book Metadata
    const title = epub.metadata?.title?.trim() || "Untitled Book";
    const author = epub.metadata?.creator?.trim() || "Unknown Author";

    // 2. Extract Cover Image if available
    let coverImage = null;
    const coverId = epub.metadata?.cover || epub.cover;
    if (coverId) {
        try {
            const [imageBuffer, mimeType] = await epub.getImageAsync(coverId);
            if (imageBuffer) {
                const mime = mimeType || "image/jpeg";
                coverImage = `data:${mime};base64,${imageBuffer.toString("base64")}`;
            }
        } catch {
            coverImage = null; // Cover extraction failed gracefully
        }
    }

    // 3. Extract and Process Chapters from the reading spine
    const spine = epub.flow || [];
    const chapters = [];
    let chapterIndex = 0;

    for (const item of spine) {
        try {
            const rawHtml = await epub.getChapterAsync(item.id);
            if (!rawHtml) continue;

            const plainText = stripHtmlTags(rawHtml);
            const wordCount = plainText ? plainText.split(/\s+/).filter(Boolean).length : 0;

            // Skip empty navigational pages or front-matter stubs that have no reading content
            if (wordCount < 10 && !item.title) {
                continue;
            }

            const chapterTitle = item.title?.trim() || extractChapterTitle(rawHtml, chapterIndex);
            const unitCount = Math.max(1, Math.ceil(wordCount / 250));
            const cleanHtml = sanitizeHtml(rawHtml);

            chapters.push({
                chapterIndex,
                title: chapterTitle,
                htmlContent: cleanHtml,
                plainTextContent: plainText,
                wordCount,
                unitCount,
            });

            chapterIndex++;
        } catch (chapterErr) {
            console.warn(`Failed to parse chapter ${item.id}:`, chapterErr.message);
        }
    }

    // 4. Calculate Aggregate Statistics
    const totalWords = chapters.reduce((sum, ch) => sum + ch.wordCount, 0);
    const totalUnits = Math.ceil(totalWords / 250);
    const totalChapters = chapters.length;

    return {
        title,
        author,
        coverImage,
        totalWords,
        totalUnits,
        totalChapters,
        chapters,
    };
}