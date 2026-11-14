import { useState } from "react";
import { uploadBookFile } from "../api/bookApi";
import { useAuth } from "../context/AuthContext";

export default function BookUploadModal({ isOpen, onClose, onSuccess }) {
    const { accessToken } = useAuth();
    const [file, setFile] = useState(null);
    const [error, setError] = useState("");
    const [uploading, setUploading] = useState(false);
    const [dragOver, setDragOver] = useState(false);

    if (!isOpen) return null;

    function validateAndSetFile(selectedFile) {
        setError("");
        if (!selectedFile) return;

        if (!selectedFile.name.toLowerCase().endsWith(".epub")) {
            setError("Only .epub files are permitted.");
            return;
        }

        if (selectedFile.size > 50 * 1024 * 1024) {
            setError("File exceeds 50 MB limit.");
            return;
        }

        setFile(selectedFile);
    }

    async function handleUpload(e) {
        e.preventDefault();
        if (!file) {
            setError("Please select an EPUB file to upload.");
            return;
        }

        setError("");
        setUploading(true);

        try {
            const data = await uploadBookFile(file, accessToken);
            setFile(null);
            onSuccess(data.book);
            onClose();
        } catch (err) {
            setError(err.message || "Failed to upload and parse EPUB");
        } finally {
            setUploading(false);
        }
    }

    function handleDrop(e) {
        e.preventDefault();
        setDragOver(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            validateAndSetFile(e.dataTransfer.files[0]);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-xs p-4">
            <div className="w-full max-w-lg rounded-card border border-border bg-surface p-6 shadow-xl animate-in fade-in duration-200">
                <div className="flex items-center justify-between pb-4 border-b border-border">
                    <div>
                        <h2 className="font-serif text-xl font-semibold text-ink">Add to Library</h2>
                        <p className="text-xs text-ink-muted mt-0.5">Upload an EPUB book to your private reading shelf</p>
                    </div>
                    <button
                        type="button"
                        disabled={uploading}
                        onClick={onClose}
                        className="text-ink-muted hover:text-ink text-sm p-1"
                    >
                        ✕
                    </button>
                </div>

                {error && (
                    <div className="mt-4 rounded-control border border-red-300 bg-red-50 p-3 text-xs text-red-700">
                        {error}
                    </div>
                )}

                <form onSubmit={handleUpload} className="mt-4 space-y-4">
                    <div
                        onDragOver={(e) => {
                            e.preventDefault();
                            setDragOver(true);
                        }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={handleDrop}
                        className={`border-2 border-dashed rounded-card p-8 text-center transition ${dragOver
                            ? "border-forest bg-forest/5"
                            : file
                                ? "border-forest/40 bg-surface-raised"
                                : "border-border hover:border-forest/40"
                            }`}
                    >
                        <input
                            type="file"
                            id="epub-file-input"
                            accept=".epub,application/epub+zip"
                            disabled={uploading}
                            onChange={(e) => validateAndSetFile(e.target.files[0])}
                            className="hidden"
                        />

                        <label htmlFor="epub-file-input" className="cursor-pointer block">
                            <div className="mx-auto h-12 w-12 rounded-full bg-forest/10 flex items-center justify-center text-forest mb-3 text-xl">
                                📖
                            </div>

                            {file ? (
                                <div>
                                    <p className="font-medium text-sm text-ink">{file.name}</p>
                                    <p className="text-xs text-ink-muted mt-1">
                                        {(file.size / (1024 * 1024)).toFixed(2)} MB • Ready to upload
                                    </p>
                                    <span className="text-xs text-forest underline mt-2 inline-block">
                                        Choose different file
                                    </span>
                                </div>
                            ) : (
                                <div>
                                    <p className="text-sm font-medium text-ink">
                                        Drop your EPUB here, or{" "}
                                        <span className="text-forest underline">browse</span>
                                    </p>
                                    <p className="text-xs text-ink-muted mt-1">Standard .epub archives up to 50 MB</p>
                                </div>
                            )}
                        </label>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                            type="button"
                            disabled={uploading}
                            onClick={onClose}
                            className="min-h-11 rounded-control border border-border bg-surface px-4 text-sm font-medium text-ink transition hover:bg-surface-raised disabled:opacity-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={!file || uploading}
                            className="min-h-11 rounded-control bg-forest px-5 text-sm font-medium text-white transition hover:bg-forest-hover disabled:cursor-not-allowed disabled:opacity-50 flex items-center gap-2"
                        >
                            {uploading && (
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            )}
                            {uploading ? "Parsing & Uploading..." : "Upload Book"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}