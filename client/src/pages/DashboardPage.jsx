import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteBookById, fetchUserBooks } from "../api/bookApi";
import BookCard from "../components/BookCard";
import BookUploadModal from "../components/BookUploadModal";
import { useAuth } from "../context/AuthContext";

export default function DashboardPage() {
    const { user, accessToken, logout, logoutAll } = useAuth();
    const navigate = useNavigate();

    const [books, setBooks] = useState([]);
    const [loadingBooks, setLoadingBooks] = useState(true);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [busy, setBusy] = useState(false);

    // Load reader's books when page loads
    useEffect(() => {
        let cancelled = false;

        async function loadBooks() {
            if (!accessToken) return;
            try {
                const data = await fetchUserBooks(accessToken);
                if (!cancelled) {
                    setBooks(data.books || []);
                }
            } catch (err) {
                console.error("Failed to load books:", err);
            } finally {
                if (!cancelled) {
                    setLoadingBooks(false);
                }
            }
        }

        loadBooks();
        return () => {
            cancelled = true;
        };
    }, [accessToken]);

    async function handleLogout(allDevices = false) {
        setBusy(true);
        try {
            if (allDevices) {
                await logoutAll();
            } else {
                await logout();
            }
            navigate("/login");
        } finally {
            setBusy(false);
        }
    }

    async function handleDeleteBook(bookId) {
        await deleteBookById(bookId, accessToken);
        setBooks((prev) => prev.filter((b) => b._id !== bookId));
    }

    function handleUploadSuccess(newBook) {
        setBooks((prev) => [newBook, ...prev]);
    }

    return (
        <div className="min-h-screen bg-paper text-ink">
            {/* 1. Folio Navigation Header */}
            <header className="border-b border-border bg-surface">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5">
                    <span className="font-serif text-2xl font-semibold tracking-tight text-forest">
                        Folio
                    </span>

                    <div className="flex items-center gap-3">
                        <span className="hidden text-sm text-ink-muted sm:inline">
                            Signed in as <strong className="text-ink">{user?.username}</strong>
                        </span>

                        <button
                            type="button"
                            disabled={busy}
                            onClick={() => handleLogout(false)}
                            className="min-h-11 rounded-control border border-border bg-surface px-4 text-sm font-medium text-ink transition hover:bg-surface-raised disabled:opacity-60"
                        >
                            Logout
                        </button>

                        <button
                            type="button"
                            disabled={busy}
                            onClick={() => handleLogout(true)}
                            className="min-h-11 rounded-control bg-forest px-4 text-sm font-medium text-white transition hover:bg-forest-hover disabled:opacity-60"
                        >
                            Logout all devices
                        </button>
                    </div>
                </div>
            </header>

            {/* 2. Main Content */}
            <main className="mx-auto max-w-6xl px-4 py-8 space-y-8">
                {/* Bookshelf Toolbar */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="font-serif text-3xl font-semibold text-ink">Your Library</h1>
                        <p className="mt-1 text-sm text-ink-muted">
                            {books.length} {books.length === 1 ? "book" : "books"} on your shelf
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => setIsUploadModalOpen(true)}
                        className="min-h-11 rounded-control bg-forest px-5 text-sm font-medium text-white transition hover:bg-forest-hover flex items-center justify-center gap-2 self-start sm:self-auto shadow-sm"
                    >
                        <span>+</span>
                        <span>Upload EPUB</span>
                    </button>
                </div>

                {/* Bookshelf Grid or States */}
                {loadingBooks ? (
                    <div className="rounded-card border border-border bg-surface p-12 text-center">
                        <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-forest border-t-transparent mb-3" />
                        <p className="font-serif text-sm text-ink-muted">Loading your library...</p>
                    </div>
                ) : books.length === 0 ? (
                    <div className="rounded-card border border-dashed border-border bg-surface p-12 text-center max-w-xl mx-auto">
                        <div className="mx-auto h-14 w-14 rounded-full bg-forest/10 flex items-center justify-center text-forest text-2xl mb-4">
                            📚
                        </div>
                        <h2 className="font-serif text-xl font-semibold text-ink">Your shelf is empty</h2>
                        <p className="mt-2 text-sm text-ink-muted leading-relaxed">
                            Upload an EPUB book to start reading, tracking your 250-word reading units, and building your reading streaks.
                        </p>
                        <button
                            type="button"
                            onClick={() => setIsUploadModalOpen(true)}
                            className="mt-6 min-h-11 rounded-control bg-forest px-6 text-sm font-medium text-white transition hover:bg-forest-hover shadow-sm"
                        >
                            Upload your first EPUB
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {books.map((book) => (
                            <BookCard key={book._id} book={book} onDelete={handleDeleteBook} />
                        ))}
                    </div>
                )}
            </main>

            {/* 3. Upload Modal */}
            <BookUploadModal
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
                onSuccess={handleUploadSuccess}
            />
        </div>
    );
}