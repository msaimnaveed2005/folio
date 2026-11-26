import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchBookDetails, fetchChapterContent } from "../api/bookApi";
import { fetchReadingProgress, saveReadingProgress } from "../api/progressApi";
import ReaderAppearanceMenu from "../components/ReaderAppearanceMenu";
import ReaderBookSpread from "../components/ReaderBookSpread";
import ReaderTocDrawer from "../components/ReaderTocDrawer";
import { useAuth } from "../context/AuthContext";

const READER_THEMES = {
    light: {
        page: "bg-[#F8F6F1] text-[#202A25]",
        surface: "bg-[#FFFFFF] text-[#202A25]",
        muted: "text-[#56635B]",
        border: "border-[#D8DDD5]",
        accentText: "text-[#2D5B4B]",
        progressBar: "bg-[#2D5B4B]",
        hoverItem: "hover:bg-black/5",
        activeItem: "bg-[#2D5B4B]/15 font-semibold text-[#1E4739] border-l-4 border-l-[#2D5B4B]",
        activeRing: "ring-2 ring-[#2D5B4B] border-[#2D5B4B]",
        activeChip: "border-[#2D5B4B] bg-[#2D5B4B]/15 text-[#1E4739]",
    },
    sepia: {
        page: "bg-[#F1E7D3] text-[#3D2E1E]",
        surface: "bg-[#FAF3E3] text-[#3D2E1E]",
        muted: "text-[#6E5943]",
        border: "border-[#D6C7A9]",
        accentText: "text-[#7A4F26]",
        progressBar: "bg-[#7A4F26]",
        hoverItem: "hover:bg-black/5",
        activeItem: "bg-[#7A4F26]/15 font-semibold text-[#5B3715] border-l-4 border-l-[#7A4F26]",
        activeRing: "ring-2 ring-[#7A4F26] border-[#7A4F26]",
        activeChip: "border-[#7A4F26] bg-[#7A4F26]/15 text-[#5B3715]",
    },
    sage: {
        page: "bg-[#E8EFEA] text-[#1D2C24]",
        surface: "bg-[#F3F8F4] text-[#1D2C24]",
        muted: "text-[#4D6357]",
        border: "border-[#C8D8CE]",
        accentText: "text-[#255241]",
        progressBar: "bg-[#255241]",
        hoverItem: "hover:bg-black/5",
        activeItem: "bg-[#255241]/15 font-semibold text-[#1B3F31] border-l-4 border-l-[#255241]",
        activeRing: "ring-2 ring-[#255241] border-[#255241]",
        activeChip: "border-[#255241] bg-[#255241]/15 text-[#1B3F31]",
    },
    dusk: {
        page: "bg-[#222831] text-[#D8DEE9]",
        surface: "bg-[#2B333E] text-[#D8DEE9]",
        muted: "text-[#9AA5B5]",
        border: "border-[#3B4554]",
        accentText: "text-[#7AD4B0]",
        progressBar: "bg-[#6EE7B7]",
        hoverItem: "hover:bg-white/10",
        activeItem: "bg-[#2D5B4B]/45 font-semibold text-[#A7F3D0] border-l-4 border-l-[#6EE7B7]",
        activeRing: "ring-2 ring-[#6EE7B7] border-[#6EE7B7]",
        activeChip: "border-[#6EE7B7] bg-[#2D5B4B]/45 text-[#A7F3D0]",
    },
    dark: {
        page: "bg-[#121B18] text-[#DCE7E1]",
        surface: "bg-[#1A2622] text-[#DCE7E1]",
        muted: "text-[#8FA399]",
        border: "border-[#2A3B35]",
        accentText: "text-[#7AD4B0]",
        progressBar: "bg-[#6EE7B7]",
        hoverItem: "hover:bg-white/10",
        activeItem: "bg-[#2D5B4B]/50 font-semibold text-[#A7F3D0] border-l-4 border-l-[#6EE7B7]",
        activeRing: "ring-2 ring-[#6EE7B7] border-[#6EE7B7]",
        activeChip: "border-[#6EE7B7] bg-[#2D5B4B]/50 text-[#A7F3D0]",
    },
};

const READER_FONTS = {
    serif: "font-serif",
    cormorant: "font-cormorant",
    lora: "font-lora",
    merriweather: "font-merriweather",
    crimson: "font-crimson",
    atkinson: "font-atkinson",
    sans: "font-sans",
};

const PREFS_KEY = "folio-reader-prefs";
const DEFAULT_PREFS = { theme: "light", fontFamily: "serif", fontSize: 18, layout: "scroll" };

function loadSavedPrefs() {
    try {
        const raw = localStorage.getItem(PREFS_KEY);
        return raw ? { ...DEFAULT_PREFS, ...JSON.parse(raw) } : DEFAULT_PREFS;
    } catch {
        return DEFAULT_PREFS;
    }
}

export default function ReaderPage() {
    const { bookId } = useParams();
    const { accessToken } = useAuth();

    const [book, setBook] = useState(null);
    const [chapters, setChapters] = useState([]);
    const [activeChapterId, setActiveChapterId] = useState(null);
    const [chapter, setChapter] = useState(null);
    const [loadingBook, setLoadingBook] = useState(true);
    const [loadingChapter, setLoadingChapter] = useState(true);
    const [error, setError] = useState("");

    const [tocOpen, setTocOpen] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [prefs, setPrefs] = useState(loadSavedPrefs);
    const [openAtEnd, setOpenAtEnd] = useState(false);

    const themeStyles = READER_THEMES[prefs.theme] || READER_THEMES.light;
    const fontClass = READER_FONTS[prefs.fontFamily] || "font-serif";
    const isBookMode = (prefs.layout || "scroll") === "spread";
    const activeIndex = chapters.findIndex((c) => c._id === activeChapterId);
    const prevChapter = activeIndex > 0 ? chapters[activeIndex - 1] : null;
    const nextChapter =
        activeIndex >= 0 && activeIndex < chapters.length - 1
            ? chapters[activeIndex + 1]
            : null;

    const completionPct =
        chapters.length > 0 && activeIndex >= 0
            ? Math.round(((activeIndex + 1) / chapters.length) * 100)
            : 0;

    function updatePrefs(patch) {
        setPrefs((prev) => {
            const next = { ...prev, ...patch };
            localStorage.setItem(PREFS_KEY, JSON.stringify(next));
            return next;
        });
    }

    const clearInitialAtEnd = useCallback(() => setOpenAtEnd(false), []);

    const handlePrevChapter = useCallback(() => {
        if (prevChapter) {
            setOpenAtEnd(true);
            setLoadingChapter(true);
            setActiveChapterId(prevChapter._id);
        }
    }, [prevChapter]);

    const handleNextChapter = useCallback(() => {
        if (nextChapter) {
            setOpenAtEnd(false);
            setLoadingChapter(true);
            setActiveChapterId(nextChapter._id);
        }
    }, [nextChapter]);

    function selectChapter(chapterId) {
        if (!chapterId || chapterId === activeChapterId) return;
        setOpenAtEnd(false);
        setLoadingChapter(true);
        setActiveChapterId(chapterId);
    }

    // 1. Load book metadata, table of contents, and last saved reading position
    useEffect(() => {
        let cancelled = false;

        async function loadBookAndProgress() {
            if (!accessToken || !bookId) return;
            try {
                const [bookData, progressData] = await Promise.all([
                    fetchBookDetails(bookId, accessToken),
                    fetchReadingProgress(bookId, accessToken).catch(() => ({ progress: null })),
                ]);

                if (cancelled) return;

                const toc = bookData.chapters || [];
                setBook(bookData.book);
                setChapters(toc);

                const savedId = progressData.progress?.currentChapterId;
                const hasSaved = toc.some((c) => c._id === savedId);
                const startId = hasSaved ? savedId : toc[0]?._id || null;

                setActiveChapterId(startId);
                if (!startId) {
                    setLoadingChapter(false);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(err.message || "Failed to load book");
                    setLoadingChapter(false);
                }
            } finally {
                if (!cancelled) {
                    setLoadingBook(false);
                }
            }
        }

        loadBookAndProgress();
        return () => {
            cancelled = true;
        };
    }, [bookId, accessToken]);

    // 2. Load active chapter HTML and persist progress whenever activeChapterId changes
    useEffect(() => {
        let cancelled = false;

        async function loadChapter() {
            if (!accessToken || !bookId || !activeChapterId) return;
            try {
                const data = await fetchChapterContent(bookId, activeChapterId, accessToken);
                if (cancelled) return;

                setChapter(data.chapter);
                window.scrollTo({ top: 0, behavior: "smooth" });

                // Compute cumulative reading units up to this chapter and save progress
                const idx = chapters.findIndex((c) => c._id === activeChapterId);
                const cumulativeUnits = chapters
                    .slice(0, Math.max(0, idx + 1))
                    .reduce((sum, c) => sum + (c.unitCount || 1), 0);
                const pct =
                    chapters.length > 0 && idx >= 0
                        ? Math.round(((idx + 1) / chapters.length) * 100)
                        : 0;

                saveReadingProgress(
                    bookId,
                    {
                        chapterId: activeChapterId,
                        chapterIndex: data.chapter.chapterIndex,
                        unit: cumulativeUnits,
                        completionPercentage: pct,
                    },
                    accessToken
                ).catch(() => { });
            } catch (err) {
                if (!cancelled) {
                    setError(err.message || "Failed to load chapter");
                }
            } finally {
                if (!cancelled) {
                    setLoadingChapter(false);
                }
            }
        }

        loadChapter();
        return () => {
            cancelled = true;
        };
    }, [bookId, activeChapterId, accessToken, chapters]);

    // 3. Keyboard arrow navigation between chapters
    useEffect(() => {
        function handleKeyDown(e) {
            if (isBookMode || tocOpen || menuOpen) return;
            if (e.key === "ArrowLeft" && prevChapter) {
                selectChapter(prevChapter._id);
            } else if (e.key === "ArrowRight" && nextChapter) {
                selectChapter(nextChapter._id);
            }
        }

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isBookMode, prevChapter, nextChapter, tocOpen, menuOpen, activeChapterId]);

    if (loadingBook) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${themeStyles.page}`}>
                <p className={`font-serif text-lg ${themeStyles.muted}`}>Opening book...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`min-h-screen flex flex-col items-center justify-center p-4 text-center ${themeStyles.page}`}>
                <p className="text-red-600 font-medium mb-4">{error}</p>
                <Link
                    to="/"
                    className="min-h-11 inline-flex items-center rounded-control bg-forest px-5 text-sm font-medium text-white"
                >
                    Back to Library
                </Link>
            </div>
        );
    }

    return (
        <div
            className={`min-h-screen transition-colors duration-200 ${themeStyles.page} ${fontClass}`}
        >
            {/* Top Reader Bar */}
            <header className={`sticky top-0 z-30 border-b ${themeStyles.surface} ${themeStyles.border}`}>
                <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-2.5 font-sans">
                    <div className="flex items-center gap-3 min-w-0">
                        <Link
                            to="/"
                            className={`min-h-11 inline-flex items-center rounded-control border px-3 text-sm font-medium transition ${themeStyles.hoverItem} ${themeStyles.border}`}
                        >
                            ← Shelf
                        </Link>
                        <span className="hidden sm:inline truncate text-sm font-medium">
                            {book?.title}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        {chapters.length > 0 && activeIndex >= 0 && (
                            <span className={`hidden md:inline text-xs mr-1 ${themeStyles.muted}`}>
                                Ch. {activeIndex + 1} of {chapters.length} • {completionPct}%
                            </span>
                        )}

                        <button
                            type="button"
                            onClick={() => {
                                setMenuOpen(false);
                                setTocOpen(true);
                            }}
                            className={`min-h-11 rounded-control border px-3.5 text-sm font-medium transition ${themeStyles.hoverItem} ${themeStyles.border}`}
                        >
                            Contents
                        </button>

                        <button
                            type="button"
                            onClick={() => setMenuOpen((prev) => !prev)}
                            aria-label="Reader appearance settings"
                            className={`min-h-11 min-w-11 rounded-control border px-3 text-sm font-serif font-semibold transition ${themeStyles.hoverItem} ${themeStyles.border}`}
                        >
                            Aa
                        </button>
                    </div>
                </div>

                {/* Reading Progress Bar */}
                <div className="h-0.5 w-full bg-forest/15">
                    <div
                        className={`h-full ${themeStyles.progressBar} transition-all duration-300`}
                        style={{ width: `${completionPct}%` }}
                    />
                </div>

                <ReaderAppearanceMenu
                    isOpen={menuOpen}
                    onClose={() => setMenuOpen(false)}
                    prefs={prefs}
                    onUpdatePrefs={updatePrefs}
                    themeStyles={themeStyles}
                />
            </header>

            {/* Main Reading Canvas */}
            {loadingChapter ? (
                <div className="mx-auto max-w-[68ch] px-5 py-24 text-center">
                    <p className={`text-sm ${themeStyles.muted}`}>Loading chapter...</p>
                </div>
            ) : !chapter ? (
                <p className={`text-center py-24 ${themeStyles.muted}`}>
                    No readable chapters found in this book.
                </p>
            ) : isBookMode ? (
                <ReaderBookSpread
                    key={chapter._id}
                    chapter={chapter}
                    fontSize={prefs.fontSize}
                    fontClass={fontClass}
                    themeStyles={themeStyles}
                    hasPrevChapter={Boolean(prevChapter)}
                    hasNextChapter={Boolean(nextChapter)}
                    onPrevChapter={handlePrevChapter}
                    onNextChapter={handleNextChapter}
                    initialAtEnd={openAtEnd}
                    onClearInitialAtEnd={clearInitialAtEnd}
                    menuOpen={menuOpen}
                    tocOpen={tocOpen}
                />
            ) : (
                <main className="mx-auto max-w-[68ch] px-5 py-10 sm:py-14">
                    <article>
                        <header className={`mb-8 pb-6 border-b ${themeStyles.border}`}>
                            <p className={`text-xs font-sans font-semibold uppercase tracking-wider ${themeStyles.accentText}`}>
                                Chapter {chapter.chapterIndex + 1} • {chapter.unitCount}{" "}
                                {chapter.unitCount === 1 ? "unit" : "units"}
                            </p>
                            <h1 className="mt-2 text-2xl sm:text-3xl font-semibold leading-snug">
                                {chapter.title}
                            </h1>
                        </header>

                        <div
                            className="reader-prose"
                            style={{ fontSize: `${prefs.fontSize}px` }}
                            dangerouslySetInnerHTML={{ __html: chapter.htmlContent }}
                        />

                        {/* Bottom Chapter Navigation */}
                        <nav
                            className={`mt-14 pt-8 border-t flex items-center justify-between gap-4 font-sans ${themeStyles.border}`}
                        >
                            <button
                                type="button"
                                disabled={!prevChapter}
                                onClick={() => selectChapter(prevChapter._id)}
                                className={`min-h-11 rounded-control border px-4 text-sm font-medium transition ${themeStyles.hoverItem} disabled:opacity-35 disabled:cursor-not-allowed ${themeStyles.border}`}
                            >
                                ← Previous
                            </button>

                            <span className={`hidden sm:inline text-xs ${themeStyles.muted}`}>
                                Tip: Use ← and → keys
                            </span>

                            <button
                                type="button"
                                disabled={!nextChapter}
                                onClick={() => selectChapter(nextChapter._id)}
                                className="min-h-11 rounded-control bg-forest px-5 text-sm font-medium text-white transition hover:bg-forest-hover disabled:opacity-35 disabled:cursor-not-allowed"
                            >
                                Next Chapter →
                            </button>
                        </nav>
                    </article>
                </main>
            )}

            <ReaderTocDrawer
                isOpen={tocOpen}
                onClose={() => setTocOpen(false)}
                bookTitle={book?.title || ""}
                chapters={chapters}
                activeChapterId={activeChapterId}
                onSelectChapter={selectChapter}
                themeStyles={themeStyles}
            />
        </div>
    );
}