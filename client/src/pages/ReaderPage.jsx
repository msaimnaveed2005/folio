import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchBookDetails, fetchChapterContent } from "../api/bookApi";
import {
    deleteTrackById,
    fetchTrackBlobUrl,
    fetchUserTracks,
    uploadTrackFile,
} from "../api/musicApi";
import { fetchReadingProgress, saveReadingProgress } from "../api/progressApi";
import ReaderAppearanceMenu from "../components/ReaderAppearanceMenu";
import ReaderBookSpread from "../components/ReaderBookSpread";
import ReaderMusicMenu from "../components/ReaderMusicMenu";
import ReaderTocDrawer from "../components/ReaderTocDrawer";
import { useAuth } from "../context/AuthContext";
import { createAmbientEngine } from "../utils/ambientAudio";

const READER_THEMES = {
    light: {
        isDark: false,
        inkText: "text-[#202A25]",
        tintHex: null,
        surfaceHex: "#FFFFFF",
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
        isDark: false,
        inkText: "text-[#3D2E1E]",
        tintHex: "#E8D5B0",
        surfaceHex: "#FAF3E3",
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
        isDark: false,
        inkText: "text-[#1D2C24]",
        tintHex: "#CBE4D3",
        surfaceHex: "#F3F8F4",
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
        isDark: true,
        inkText: "text-[#D8DEE9]",
        tintHex: null,
        surfaceHex: "#2B333E",
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
    solarized: {
        isDark: false,
        inkText: "text-[#3B4D54]",
        tintHex: "#F5E4B8",
        surfaceHex: "#EEE8D5",
        page: "bg-[#FDF6E3] text-[#3B4D54]",
        surface: "bg-[#EEE8D5] text-[#3B4D54]",
        muted: "text-[#657B83]",
        border: "border-[#DDD6C1]",
        accentText: "text-[#1E7E75]",
        progressBar: "bg-[#2AA198]",
        hoverItem: "hover:bg-black/5",
        activeItem: "bg-[#2AA198]/15 font-semibold text-[#15615A] border-l-4 border-l-[#2AA198]",
        activeRing: "ring-2 ring-[#2AA198] border-[#2AA198]",
        activeChip: "border-[#2AA198] bg-[#2AA198]/15 text-[#15615A]",
    },
    vintage: {
        isDark: false,
        inkText: "text-[#2B2E33]",
        tintHex: "#DFD4B8",
        surfaceHex: "#F4EFE2",
        page: "bg-[#EAE4D2] text-[#2B2E33]",
        surface: "bg-[#F4EFE2] text-[#2B2E33]",
        muted: "text-[#635E53]",
        border: "border-[#D5CCB6]",
        accentText: "text-[#8C5828]",
        progressBar: "bg-[#A36B39]",
        hoverItem: "hover:bg-black/5",
        activeItem: "bg-[#A36B39]/15 font-semibold text-[#6F4219] border-l-4 border-l-[#A36B39]",
        activeRing: "ring-2 ring-[#A36B39] border-[#A36B39]",
        activeChip: "border-[#A36B39] bg-[#A36B39]/15 text-[#6F4219]",
    },
    gruvbox: {
        isDark: true,
        inkText: "text-[#EBDBB2]",
        tintHex: null,
        surfaceHex: "#32302F",
        page: "bg-[#282828] text-[#EBDBB2]",
        surface: "bg-[#32302F] text-[#EBDBB2]",
        muted: "text-[#A89984]",
        border: "border-[#45403D]",
        accentText: "text-[#FABD2F]",
        progressBar: "bg-[#FABD2F]",
        hoverItem: "hover:bg-white/10",
        activeItem: "bg-[#FABD2F]/20 font-semibold text-[#FDE08D] border-l-4 border-l-[#FABD2F]",
        activeRing: "ring-2 ring-[#FABD2F] border-[#FABD2F]",
        activeChip: "border-[#FABD2F] bg-[#FABD2F]/20 text-[#FDE08D]",
    },
    rosepine: {
        isDark: true,
        inkText: "text-[#E0DEF4]",
        tintHex: null,
        surfaceHex: "#1F1D2E",
        page: "bg-[#191724] text-[#E0DEF4]",
        surface: "bg-[#1F1D2E] text-[#E0DEF4]",
        muted: "text-[#908CAA]",
        border: "border-[#393552]",
        accentText: "text-[#EBBCBA]",
        progressBar: "bg-[#EBBCBA]",
        hoverItem: "hover:bg-white/10",
        activeItem: "bg-[#EBBCBA]/20 font-semibold text-[#F5D6D4] border-l-4 border-l-[#EBBCBA]",
        activeRing: "ring-2 ring-[#EBBCBA] border-[#EBBCBA]",
        activeChip: "border-[#EBBCBA] bg-[#EBBCBA]/20 text-[#F5D6D4]",
    },
    dark: {
        isDark: true,
        inkText: "text-[#DCE7E1]",
        tintHex: null,
        surfaceHex: "#1A2622",
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
const DEFAULT_PREFS = {
    theme: "light",
    fontFamily: "serif",
    fontSize: 18,
    layout: "scroll",
    bookStyle: "classic",
};

function loadSavedPrefs() {
    try {
        const raw = localStorage.getItem(PREFS_KEY);
        return raw ? { ...DEFAULT_PREFS, ...JSON.parse(raw) } : DEFAULT_PREFS;
    } catch {
        return DEFAULT_PREFS;
    }
}

function resolveChapterImages(html, bookId) {
    if (!html) return "";
    return html.replace(
        /(<img\b[^>]*\bsrc=["'])\/images\/([^"']+)(["'])/gi,
        (_, prefix, assetPath, quote) =>
            `${prefix}http://localhost:3000/api/books/${bookId}/asset?path=${encodeURIComponent(assetPath)}${quote}`
    );
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
    const [musicOpen, setMusicOpen] = useState(false);
    const [prefs, setPrefs] = useState(loadSavedPrefs);
    const [openAtEnd, setOpenAtEnd] = useState(false);

    // Persistent reading music state (never autoplays on mount)
    const [musicSource, setMusicSource] = useState({ kind: "preset", id: "soft-rain" });
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoadingTrack, setIsLoadingTrack] = useState(false);
    const [volume, setVolume] = useState(0.45);
    const [tracks, setTracks] = useState([]);
    const [uploadingTrack, setUploadingTrack] = useState(false);
    const [musicError, setMusicError] = useState("");

    const ambientEngineRef = useRef(null);
    const audioElRef = useRef(null);
    const blobCacheRef = useRef(new Map());
    const streamAbortRef = useRef(null);

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

                setChapter({
                    ...data.chapter,
                    htmlContent: resolveChapterImages(data.chapter.htmlContent, bookId),
                });
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

    // 3. Load user's saved custom audio tracks and clean up audio resources on unmount
    useEffect(() => {
        let cancelled = false;
        async function loadTracks() {
            if (!accessToken) return;
            try {
                const data = await fetchUserTracks(accessToken);
                if (!cancelled) {
                    setTracks(data.tracks || []);
                }
            } catch {
                // Keep offline presets usable even if track list fails silently
            }
        }
        loadTracks();
        return () => {
            cancelled = true;
        };
    }, [accessToken]);

    useEffect(() => {
        const blobCache = blobCacheRef.current;
        return () => {
            streamAbortRef.current?.abort();
            ambientEngineRef.current?.dispose();
            if (audioElRef.current) {
                audioElRef.current.pause();
                audioElRef.current.src = "";
            }
            blobCache.forEach((url) => URL.revokeObjectURL(url));
            blobCache.clear();
        };
    }, []);

    function getAudioElement() {
        if (!audioElRef.current) {
            const el = new Audio();
            el.loop = true;
            audioElRef.current = el;
        }
        return audioElRef.current;
    }

    function stopAllAudio() {
        streamAbortRef.current?.abort();
        ambientEngineRef.current?.stop();
        if (audioElRef.current) {
            audioElRef.current.pause();
        }
        setIsLoadingTrack(false);
        setIsPlaying(false);
    }

    function startPreset(presetId, nextVol = volume) {
        streamAbortRef.current?.abort();
        if (audioElRef.current) {
            audioElRef.current.pause();
        }
        setMusicError("");
        setIsLoadingTrack(false);
        if (!ambientEngineRef.current) {
            ambientEngineRef.current = createAmbientEngine();
        }
        ambientEngineRef.current.play(presetId, nextVol);
        setMusicSource({ kind: "preset", id: presetId });
        setIsPlaying(true);
    }

    async function startCustomTrack(track, nextVol = volume) {
        streamAbortRef.current?.abort();
        ambientEngineRef.current?.stop();
        const audio = getAudioElement();
        audio.pause();

        setMusicError("");
        setMusicSource({ kind: "custom", id: track._id, title: track.title });
        setIsLoadingTrack(true);

        const controller = new AbortController();
        streamAbortRef.current = controller;

        try {
            let blobUrl = blobCacheRef.current.get(track._id);
            if (!blobUrl) {
                blobUrl = await fetchTrackBlobUrl(track._id, accessToken, controller.signal);
                if (controller.signal.aborted) {
                    URL.revokeObjectURL(blobUrl);
                    return;
                }
                blobCacheRef.current.set(track._id, blobUrl);
            }

            audio.src = blobUrl;
            audio.loop = true;
            audio.volume = nextVol;
            await audio.play();
            if (!controller.signal.aborted) {
                setIsPlaying(true);
            }
        } catch (err) {
            if (err.name !== "AbortError") {
                setIsPlaying(false);
                setMusicError(err.message || "Could not play audio track");
            }
        } finally {
            if (!controller.signal.aborted) {
                setIsLoadingTrack(false);
            }
        }
    }

    function handleTogglePlay() {
        if (isPlaying) {
            stopAllAudio();
            return;
        }
        if (musicSource.kind === "custom") {
            const match = tracks.find((t) => t._id === musicSource.id);
            if (match) {
                startCustomTrack(match, volume);
                return;
            }
        }
        startPreset(musicSource.id || "soft-rain", volume);
    }

    function handleSelectPreset(presetId) {
        startPreset(presetId, volume);
    }

    function handleSelectCustomTrack(track) {
        startCustomTrack(track, volume);
    }

    function handleVolumeChange(nextVol) {
        setVolume(nextVol);
        ambientEngineRef.current?.setVolume(nextVol);
        if (audioElRef.current) {
            audioElRef.current.volume = nextVol;
        }
    }

    async function handleUploadTrack(file) {
        if (file.size > 25 * 1024 * 1024) {
            setMusicError("Audio file exceeds the 25 MB limit.");
            return;
        }
        setMusicError("");
        setUploadingTrack(true);
        try {
            const data = await uploadTrackFile(file, "", accessToken);
            if (data.track) {
                setTracks((prev) => [data.track, ...prev]);
                if (!isPlaying) {
                    setMusicSource({ kind: "custom", id: data.track._id, title: data.track.title });
                }
            }
        } catch (err) {
            setMusicError(err.message || "Failed to upload audio track");
        } finally {
            setUploadingTrack(false);
        }
    }

    async function handleDeleteTrack(trackId) {
        setMusicError("");
        try {
            await deleteTrackById(trackId, accessToken);
            setTracks((prev) => prev.filter((t) => t._id !== trackId));

            const cachedUrl = blobCacheRef.current.get(trackId);
            if (cachedUrl) {
                URL.revokeObjectURL(cachedUrl);
                blobCacheRef.current.delete(trackId);
            }

            if (musicSource.kind === "custom" && musicSource.id === trackId) {
                stopAllAudio();
                setMusicSource({ kind: "preset", id: "soft-rain" });
            }
        } catch (err) {
            setMusicError(err.message || "Failed to delete track");
        }
    }

    // 4. Keyboard arrow navigation between chapters
    useEffect(() => {
        function handleKeyDown(e) {
            if (isBookMode || tocOpen || menuOpen || musicOpen) return;
            if (e.key === "ArrowLeft" && prevChapter) {
                selectChapter(prevChapter._id);
            } else if (e.key === "ArrowRight" && nextChapter) {
                selectChapter(nextChapter._id);
            }
        }

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isBookMode, prevChapter, nextChapter, tocOpen, menuOpen, musicOpen, activeChapterId]);

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
                                setMusicOpen(false);
                                setTocOpen(true);
                            }}
                            className={`min-h-11 rounded-control border px-3.5 text-sm font-medium transition ${themeStyles.hoverItem} ${themeStyles.border}`}
                        >
                            Contents
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                setTocOpen(false);
                                setMusicOpen(false);
                                setMenuOpen((prev) => !prev);
                            }}
                            aria-label="Reader appearance settings"
                            className={`min-h-11 min-w-11 rounded-control border px-3 text-sm font-serif font-semibold transition ${themeStyles.hoverItem} ${themeStyles.border}`}
                        >
                            Aa
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                setTocOpen(false);
                                setMenuOpen(false);
                                setMusicOpen((prev) => !prev);
                            }}
                            aria-label="Reading music settings"
                            className={`min-h-11 rounded-control border px-3 text-sm font-medium transition flex items-center gap-1.5 cursor-pointer ${
                                isPlaying
                                    ? themeStyles.activeChip
                                    : `${themeStyles.hoverItem} ${themeStyles.border}`
                            }`}
                        >
                            <span aria-hidden="true">♪</span>
                            <span className="hidden sm:inline">{isPlaying ? "Playing" : "Music"}</span>
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

                <ReaderMusicMenu
                    isOpen={musicOpen}
                    onClose={() => setMusicOpen(false)}
                    themeStyles={themeStyles}
                    musicSource={musicSource}
                    isPlaying={isPlaying}
                    isLoadingTrack={isLoadingTrack}
                    volume={volume}
                    tracks={tracks}
                    uploading={uploadingTrack}
                    error={musicError}
                    onTogglePlay={handleTogglePlay}
                    onSelectPreset={handleSelectPreset}
                    onSelectCustomTrack={handleSelectCustomTrack}
                    onVolumeChange={handleVolumeChange}
                    onUploadTrack={handleUploadTrack}
                    onDeleteTrack={handleDeleteTrack}
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
                    bookTitle={book?.title || ""}
                    chapter={chapter}
                    fontSize={prefs.fontSize}
                    fontClass={fontClass}
                    themeStyles={themeStyles}
                    bookStyle={prefs.bookStyle || "classic"}
                    hasPrevChapter={Boolean(prevChapter)}
                    hasNextChapter={Boolean(nextChapter)}
                    nextChapterTitle={nextChapter?.title || ""}
                    onPrevChapter={handlePrevChapter}
                    onNextChapter={handleNextChapter}
                    initialAtEnd={openAtEnd}
                    onClearInitialAtEnd={clearInitialAtEnd}
                    menuOpen={menuOpen || musicOpen}
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