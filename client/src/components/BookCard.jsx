import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function BookCard({ book, onDelete }) {
    const navigate = useNavigate();
    const [deleting, setDeleting] = useState(false);
    const isReady = book.processingStatus === "ready";

    function handleOpen() {
        if (isReady) {
            navigate(`/read/${book._id}`);
        }
    }

    async function handleDelete(e) {
        e.stopPropagation();
        if (!window.confirm(`Are you sure you want to remove "${book.title}" from your library?`)) {
            return;
        }
        setDeleting(true);
        try {
            await onDelete(book._id);
        } finally {
            setDeleting(false);
        }
    }

    return (
        <div
            onClick={handleOpen}
            className={`group relative flex flex-col overflow-hidden rounded-card border border-border bg-surface shadow-sm transition hover:shadow-md ${isReady ? "cursor-pointer" : ""
                }`}
        >
            {/* 1. Book Cover or Fallback */}
            <div className="relative aspect-[3/4] w-full overflow-hidden bg-surface-raised border-b border-border flex items-center justify-center">
                {book.coverImage ? (
                    <img
                        src={book.coverImage}
                        alt={book.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center p-6 text-center">
                        <span className="font-serif text-lg font-semibold text-ink line-clamp-3">
                            {book.title}
                        </span>
                        <span className="mt-2 text-xs text-ink-muted line-clamp-1">
                            {book.author}
                        </span>
                        <span className="mt-4 rounded-full bg-forest/10 px-2.5 py-1 text-[11px] font-medium text-forest">
                            EPUB
                        </span>
                    </div>
                )}

                {/* Status Indicator if not yet ready */}
                {book.processingStatus === "processing" && (
                    <div className="absolute inset-0 bg-paper/85 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-center">
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-forest border-t-transparent mb-2" />
                        <p className="text-xs font-medium text-forest">Processing chapters...</p>
                    </div>
                )}

                {book.processingStatus === "failed" && (
                    <div className="absolute inset-0 bg-red-50/90 flex flex-col items-center justify-center p-4 text-center">
                        <p className="text-xs font-semibold text-red-700">Failed to parse</p>
                        <p className="mt-1 text-[11px] text-red-600 line-clamp-2">{book.processingError}</p>
                    </div>
                )}
            </div>

            {/* 2. Book Info */}
            <div className="flex flex-1 flex-col p-4">
                <h3 className="font-serif text-base font-semibold text-ink line-clamp-1" title={book.title}>
                    {book.title}
                </h3>
                <p className="mt-0.5 text-xs text-ink-muted line-clamp-1">{book.author}</p>

                {/* 3. Folio Reading Metrics */}
                <div className="mt-3 flex items-center gap-2 text-xs text-ink-muted">
                    <span className="font-medium text-forest">
                        {book.totalUnits} {book.totalUnits === 1 ? "unit" : "units"}
                    </span>
                    <span>•</span>
                    <span>
                        {book.totalChapters} {book.totalChapters === 1 ? "chapter" : "chapters"}
                    </span>
                </div>

                {/* 4. Actions */}
                <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between">
                    <span className="text-[11px] text-ink-muted">
                        {(book.fileSize / (1024 * 1024)).toFixed(1)} MB
                    </span>

                    <div className="flex items-center gap-3">
                        {isReady && (
                            <span className="text-xs font-medium text-forest group-hover:underline">
                                Read →
                            </span>
                        )}
                        <button
                            type="button"
                            disabled={deleting}
                            onClick={handleDelete}
                            aria-label="Delete book"
                            className="text-xs font-medium text-red-600 hover:text-red-700 hover:underline disabled:opacity-50"
                        >
                            {deleting ? "Deleting..." : "Delete"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}