import { useEffect, useRef, useState } from "react";

const DESKTOP_GAP = 56;
const MOBILE_GAP = 28;

export default function ReaderBookSpread({
    chapter,
    fontSize,
    fontClass,
    themeStyles,
    hasPrevChapter,
    hasNextChapter,
    onPrevChapter,
    onNextChapter,
    initialAtEnd,
    onClearInitialAtEnd,
    menuOpen,
    tocOpen,
}) {
    const viewportRef = useRef(null);
    const contentRef = useRef(null);
    const [spreadIndex, setSpreadIndex] = useState(0);
    const [layout, setLayout] = useState(() => ({
        viewportWidth: 0,
        totalSpreads: 1,
        columns: typeof window !== "undefined" && window.innerWidth >= 768 ? 2 : 1,
        gap: typeof window !== "undefined" && window.innerWidth >= 768 ? DESKTOP_GAP : MOBILE_GAP,
    }));

    // Measure horizontal CSS multi-column pagination whenever size, font, or chapter changes
    useEffect(() => {
        const viewport = viewportRef.current;
        const content = contentRef.current;
        if (!viewport || !content) return;

        function measure() {
            const w = viewport.clientWidth;
            const cols = w >= 768 ? 2 : 1;
            const gap = cols === 2 ? DESKTOP_GAP : MOBILE_GAP;
            const stride = w + gap;
            if (w <= 0 || stride <= 0) return;

            const totalWidth = content.scrollWidth;
            const totalSpreads = Math.max(1, Math.ceil((totalWidth + gap - 4) / stride));

            setLayout((prev) => {
                if (
                    prev.viewportWidth === w &&
                    prev.totalSpreads === totalSpreads &&
                    prev.columns === cols &&
                    prev.gap === gap
                ) {
                    return prev;
                }
                return { viewportWidth: w, totalSpreads, columns: cols, gap };
            });

            if (cols === layout.columns) {
                if (initialAtEnd) {
                    setSpreadIndex(totalSpreads - 1);
                    onClearInitialAtEnd();
                } else {
                    setSpreadIndex((prev) => Math.min(prev, totalSpreads - 1));
                }
            }
        }

        const rafId = requestAnimationFrame(measure);
        const observer = new ResizeObserver(() => requestAnimationFrame(measure));
        observer.observe(viewport);

        return () => {
            cancelAnimationFrame(rafId);
            observer.disconnect();
        };
    }, [chapter._id, fontSize, fontClass, layout.columns, initialAtEnd, onClearInitialAtEnd]);

    const stride = layout.viewportWidth + layout.gap;
    const translateX = spreadIndex * stride;
    const isFirstSpread = spreadIndex === 0;
    const isLastSpread = spreadIndex >= layout.totalSpreads - 1;

    function handlePrev() {
        if (!isFirstSpread) {
            setSpreadIndex((s) => s - 1);
        } else if (hasPrevChapter) {
            onPrevChapter();
        }
    }

    function handleNext() {
        if (!isLastSpread) {
            setSpreadIndex((s) => s + 1);
        } else if (hasNextChapter) {
            onNextChapter();
        }
    }

    // Turn 2-page spreads with Left / Right arrow keys
    useEffect(() => {
        function handleKeyDown(e) {
            if (tocOpen || menuOpen) return;
            if (e.key === "ArrowLeft") {
                if (!isFirstSpread) {
                    setSpreadIndex((s) => s - 1);
                } else if (hasPrevChapter) {
                    onPrevChapter();
                }
            } else if (e.key === "ArrowRight") {
                if (!isLastSpread) {
                    setSpreadIndex((s) => s + 1);
                } else if (hasNextChapter) {
                    onNextChapter();
                }
            }
        }

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [
        isFirstSpread,
        isLastSpread,
        hasPrevChapter,
        hasNextChapter,
        onPrevChapter,
        onNextChapter,
        tocOpen,
        menuOpen,
    ]);

    const pageLabel =
        layout.columns === 2
            ? `Pages ${spreadIndex * 2 + 1}–${spreadIndex * 2 + 2} • Spread ${spreadIndex + 1} of ${layout.totalSpreads}`
            : `Page ${spreadIndex + 1} of ${layout.totalSpreads}`;

    return (
        <div className="mx-auto max-w-6xl px-3 sm:px-6 py-4 sm:py-6">
            {/* Open Hardcover Book Frame */}
            <div
                className={`relative rounded-card border shadow-md px-5 py-6 sm:px-10 sm:py-8 ${themeStyles.surface} ${themeStyles.border}`}
            >
                <div
                    ref={viewportRef}
                    className="relative h-[64vh] min-h-[400px] max-h-[700px] w-full overflow-hidden"
                >
                    {/* Center Book Spine Crease (Desktop 2-Page View) */}
                    {layout.columns === 2 && (
                        <div
                            aria-hidden="true"
                            className="pointer-events-none absolute inset-y-0 left-1/2 -translate-x-1/2 z-10 flex items-stretch"
                        >
                            <div className={`w-px h-full border-r opacity-70 ${themeStyles.border}`} />
                        </div>
                    )}

                    {/* Horizontal Multi-Column Track */}
                    <div
                        ref={contentRef}
                        className="h-full w-full transition-transform duration-300 ease-out [&_img]:max-h-[45vh]"
                        style={{
                            columnCount: layout.columns,
                            columnGap: `${layout.gap}px`,
                            columnFill: "auto",
                            transform: `translateX(-${translateX}px)`,
                        }}
                    >
                        <header className={`mb-5 pb-4 border-b break-after-avoid ${themeStyles.border}`}>
                            <p className={`text-xs font-sans font-semibold uppercase tracking-wider ${themeStyles.accentText}`}>
                                Chapter {chapter.chapterIndex + 1} • {chapter.unitCount}{" "}
                                {chapter.unitCount === 1 ? "unit" : "units"}
                            </p>
                            <h1 className="mt-1.5 text-xl sm:text-2xl font-semibold leading-snug">
                                {chapter.title}
                            </h1>
                        </header>

                        <div
                            className="reader-prose"
                            style={{ fontSize: `${fontSize}px` }}
                            dangerouslySetInnerHTML={{ __html: chapter.htmlContent }}
                        />
                    </div>
                </div>

                {/* Spread Footer Controls */}
                <footer
                    className={`mt-5 pt-4 border-t flex items-center justify-between gap-3 font-sans ${themeStyles.border}`}
                >
                    <button
                        type="button"
                        disabled={isFirstSpread && !hasPrevChapter}
                        onClick={handlePrev}
                        className={`min-h-11 rounded-control border px-4 text-sm font-medium transition ${themeStyles.hoverItem} disabled:opacity-35 disabled:cursor-not-allowed ${themeStyles.border}`}
                    >
                        {isFirstSpread ? "← Prev Chapter" : "← Previous"}
                    </button>

                    <span className={`text-xs text-center ${themeStyles.muted}`}>{pageLabel}</span>

                    <button
                        type="button"
                        disabled={isLastSpread && !hasNextChapter}
                        onClick={handleNext}
                        className="min-h-11 rounded-control bg-forest px-5 text-sm font-medium text-white transition hover:bg-forest-hover disabled:opacity-35 disabled:cursor-not-allowed"
                    >
                        {isLastSpread ? "Next Chapter →" : "Next Page →"}
                    </button>
                </footer>
            </div>
        </div>
    );
}