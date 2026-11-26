import { useEffect, useRef, useState } from "react";

const FRAMED_DESKTOP_GAP = 64;
const MOBILE_GAP = 28;
const FLIP_DURATION_MS = 520;

const BOOK_WORLDS = {
    classic: {
        image: "/books/classic-novel.jpg",
        darkImage: "/books/classic-novel-dark.jpg",
        alt: "Open leather-bound classic novel resting on a mahogany library desk",
        stageBg: "bg-[#19110C]",
        aspect: 1220 / 668,
        mobileCard: "border-l-[#5A3825] bg-[#FAF3E3] text-[#2A2018] ring-[#D6C7A9]",
        mobileRibbon: "bg-gradient-to-b from-[#8B1E24] to-[#5E1116]",
        // Tightly calibrated for the cropped 1220x668 full-viewport frame (~74.6% width inside sheets)
        pageBox: { top: "9.2%", right: "13.0%", bottom: "18.2%", left: "12.4%" },
        flipPaperBg: "#EAE0C8",
        darkFlipPaperBg: "#1F232B",
        ornateCorners: false,
    },
    fantasy: {
        image: "/books/fantasy-tome.jpg",
        darkImage: "/books/fantasy-tome-dark.jpg",
        alt: "Open fantasy grimoire with aged parchment pages on a candlelit carved oak desk",
        stageBg: "bg-[#0D0F18]",
        aspect: 1220 / 668,
        mobileCard: "border-l-[#252B48] bg-[#EFE3C5] text-[#2B1F14] ring-[#C7B089]",
        mobileRibbon: "bg-gradient-to-b from-[#1D6B4A] to-[#0E422C]",
        pageBox: { top: "9.2%", right: "13.0%", bottom: "18.2%", left: "12.4%" },
        flipPaperBg: "#E6D2A8",
        darkFlipPaperBg: "#1F232B",
        ornateCorners: true,
    },
    journal: {
        image: "/books/life-improvement.jpg",
        darkImage: "/books/life-improvement-dark.jpg",
        alt: "Open sage-linen hardcover book resting on a sunlit Nordic oak desk",
        stageBg: "bg-[#2C241B]",
        aspect: 1142 / 642,
        mobileCard: "border-l-[#476150] bg-[#FAF7F0] text-[#1E2B23] ring-[#D4CFC2]",
        mobileRibbon: "bg-gradient-to-b from-[#B65E3D] to-[#8C4327]",
        // Tightly calibrated for cropped 1142x642 full-viewport frame (~77.8% width inside sheets)
        pageBox: { top: "6.8%", right: "11.4%", bottom: "11.2%", left: "10.8%" },
        flipPaperBg: "#F3EFE5",
        darkFlipPaperBg: "#1F232B",
        ornateCorners: false,
    },
    minimal: {
        image: "/books/modern-minimal.jpg",
        darkImage: "/books/modern-minimal-dark.jpg",
        alt: "Open matte charcoal cloth book resting on a cool slate studio desk",
        stageBg: "bg-[#22272C]",
        aspect: 1142 / 642,
        mobileCard: "border-l-[#333840] bg-[#F5F4EE] text-[#20252A] ring-[#D4D6D2]",
        mobileRibbon: "bg-gradient-to-b from-[#64748B] to-[#475569]",
        pageBox: { top: "6.8%", right: "11.4%", bottom: "11.2%", left: "10.8%" },
        flipPaperBg: "#F1EFE6",
        darkFlipPaperBg: "#1F232B",
        ornateCorners: false,
    },
};

function OrnateCornerClasp({ positionClass }) {
    return (
        <svg
            aria-hidden="true"
            viewBox="0 0 40 40"
            className={`pointer-events-none absolute w-[4.0%] h-[6.8%] text-[#D4AF37] drop-shadow-[0_1px_2px_rgba(0,0,0,0.65)] z-20 ${positionClass}`}
            fill="none"
        >
            <path
                d="M2 32V6C2 3.8 3.8 2 6 2H32L25 8H10C8.9 8 8 8.9 8 10V25L2 32Z"
                fill="currentColor"
                fillOpacity="0.82"
            />
            <path
                d="M5 17C5 10.5 10.5 5 17 5"
                stroke="#FFF3C4"
                strokeWidth="1.2"
                strokeOpacity="0.65"
            />
            <circle cx="11.5" cy="11.5" r="2.2" fill="#FFF3C4" fillOpacity="0.85" />
        </svg>
    );
}

function TurningLeafSurface({ world, isFramed, themeStyles, children }) {
    const leafBg = isFramed
        ? undefined
        : themeStyles.isDark
        ? world.darkFlipPaperBg
        : world.flipPaperBg;

    return (
        <div
            className={`relative h-full w-full overflow-hidden ${isFramed ? themeStyles.surface : ""}`}
            style={leafBg ? { backgroundColor: leafBg } : undefined}
        >
            <div className="relative h-full w-full">{children}</div>
        </div>
    );
}

function ChapterTrack({
    trackRef,
    spread,
    stride,
    columns,
    gap,
    viewportWidth,
    offsetLeft = 0,
    htmlStartsWithHeading,
    chapter,
    fontSize,
    isRealDeskSpread,
    themeStyles,
}) {
    const effectiveFontSize = isRealDeskSpread
        ? Math.max(12, Math.round(fontSize * 0.8 * 10) / 10)
        : fontSize;

    return (
        <div
            ref={trackRef}
            className="h-full [&_img]:max-h-[var(--book-img-max-h,36vh)]"
            style={{
                width: viewportWidth ? `${viewportWidth}px` : "100%",
                marginLeft: `${offsetLeft}px`,
                columnCount: columns,
                columnGap: `${gap}px`,
                columnFill: "auto",
                transform: `translateX(-${spread * stride}px)`,
            }}
        >
            {htmlStartsWithHeading ? (
                <p
                    className={`${
                        isRealDeskSpread ? "mb-1.5 text-[10px]" : "mb-3 text-xs"
                    } font-sans font-semibold uppercase tracking-widest ${themeStyles.accentText}`}
                >
                    Chapter {chapter.chapterIndex + 1} • {chapter.unitCount}{" "}
                    {chapter.unitCount === 1 ? "unit" : "units"}
                </p>
            ) : (
                <header
                    className={`${
                        isRealDeskSpread ? "mb-3 pb-2" : "mb-5 pb-3"
                    } border-b break-after-avoid ${themeStyles.border}`}
                >
                    <p
                        className={`${
                            isRealDeskSpread ? "text-[10px]" : "text-xs"
                        } font-sans font-semibold uppercase tracking-widest ${themeStyles.accentText}`}
                    >
                        Chapter {chapter.chapterIndex + 1} • {chapter.unitCount}{" "}
                        {chapter.unitCount === 1 ? "unit" : "units"}
                    </p>
                    <h1
                        className={`mt-1 font-semibold leading-snug ${
                            isRealDeskSpread ? "text-base sm:text-lg lg:text-xl" : "text-xl sm:text-2xl"
                        }`}
                    >
                        {chapter.title}
                    </h1>
                </header>
            )}

            <div
                className={`reader-prose ${isRealDeskSpread ? "reader-book-prose" : ""}`}
                style={{ fontSize: `${effectiveFontSize}px` }}
                dangerouslySetInnerHTML={{ __html: chapter.htmlContent }}
            />
        </div>
    );
}

export default function ReaderBookSpread({
    bookTitle,
    chapter,
    fontSize,
    fontClass,
    themeStyles,
    bookStyle = "classic",
    hasPrevChapter,
    hasNextChapter,
    nextChapterTitle,
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
    const [flip, setFlip] = useState(null); // { dir: "next" | "prev", from: number, to: number }
    const [rightPageEmpty, setRightPageEmpty] = useState(false);
    const [layout, setLayout] = useState(() => {
        const isDesk = typeof window !== "undefined" ? window.innerWidth >= 768 : true;
        return {
            viewportWidth: 0,
            imgMaxHeight: 280,
            totalSpreads: 1,
            isDesktop: isDesk,
            columns: isDesk ? 2 : 1,
            gap: isDesk ? FRAMED_DESKTOP_GAP : MOBILE_GAP,
        };
    });

    const isFramed = bookStyle === "framed";
    const world = BOOK_WORLDS[bookStyle] || BOOK_WORLDS.classic;
    const htmlStartsWithHeading = /^\s*(?:<div[^>]*>\s*)*<h[1-3]\b/i.test(
        chapter.htmlContent || ""
    );

    // Measure multi-column pagination on mount, resize, font change, book view switch, spread turn, and image load
    useEffect(() => {
        const viewport = viewportRef.current;
        const content = contentRef.current;
        if (!viewport || !content || flip) return;

        function measure() {
            const w = viewport.clientWidth;
            const h = viewport.clientHeight;
            const isDesk = typeof window !== "undefined" ? window.innerWidth >= 768 : true;
            const cols = isDesk ? 2 : 1;
            const rawGap = cols === 2 ? (isFramed ? FRAMED_DESKTOP_GAP : Math.max(44, Math.round(w * 0.072))) : MOBILE_GAP;
            const gap = cols === 2 ? rawGap - (rawGap % 2) : MOBILE_GAP;
            const stride = w + gap;
            const imgMaxHeight = h > 0 ? Math.max(140, Math.round(h * 0.64)) : 280;
            if (w <= 0 || stride <= 0) return;

            const totalWidth = content.scrollWidth;
            const totalSpreads = Math.max(1, Math.ceil((totalWidth + gap - 4) / stride));

            setLayout((prev) => {
                if (
                    prev.viewportWidth === w &&
                    prev.imgMaxHeight === imgMaxHeight &&
                    prev.totalSpreads === totalSpreads &&
                    prev.isDesktop === isDesk &&
                    prev.columns === cols &&
                    prev.gap === gap
                ) {
                    return prev;
                }
                return {
                    viewportWidth: w,
                    imgMaxHeight,
                    totalSpreads,
                    isDesktop: isDesk,
                    columns: cols,
                    gap,
                };
            });

            if (cols === layout.columns) {
                if (initialAtEnd) {
                    setSpreadIndex(totalSpreads - 1);
                    onClearInitialAtEnd();
                } else {
                    setSpreadIndex((prev) => Math.min(prev, totalSpreads - 1));
                }
            }

            if (cols === 2) {
                const centerX = viewport.getBoundingClientRect().left + w / 2 + 4;
                const nodes = content.querySelectorAll(
                    ".reader-prose p, .reader-prose h1, .reader-prose h2, .reader-prose h3, .reader-prose blockquote, .reader-prose img, .reader-prose li, header"
                );
                let maxRight = 0;
                nodes.forEach((el) => {
                    const r = el.getBoundingClientRect();
                    if (r.width > 0 || r.height > 0) {
                        maxRight = Math.max(maxRight, r.right);
                    }
                });
                setRightPageEmpty(maxRight > 0 && maxRight <= centerX);
            } else {
                setRightPageEmpty(false);
            }
        }

        function scheduleMeasure() {
            return requestAnimationFrame(measure);
        }

        const rafId = scheduleMeasure();
        const observer = new ResizeObserver(scheduleMeasure);
        observer.observe(viewport);
        window.addEventListener("resize", scheduleMeasure);
        content.addEventListener("load", scheduleMeasure, true);

        return () => {
            cancelAnimationFrame(rafId);
            observer.disconnect();
            window.removeEventListener("resize", scheduleMeasure);
            content.removeEventListener("load", scheduleMeasure, true);
        };
    }, [
        chapter._id,
        fontSize,
        fontClass,
        bookStyle,
        isFramed,
        layout.columns,
        spreadIndex,
        initialAtEnd,
        onClearInitialAtEnd,
        flip,
    ]);

    // Finish 3D page flip cleanly after animation settles
    useEffect(() => {
        if (!flip) return;
        const timer = setTimeout(() => {
            setSpreadIndex(flip.to);
            setFlip(null);
        }, FLIP_DURATION_MS);

        return () => clearTimeout(timer);
    }, [flip]);

    const isTwoPage = layout.columns === 2;
    const isDesktop = layout.isDesktop;
    const isRealDeskSpread = !isFramed && isDesktop;
    const stride = layout.viewportWidth + layout.gap;
    const activeSpread = flip ? flip.to : spreadIndex;
    const isFirstSpread = activeSpread === 0;
    const isLastSpread = activeSpread >= layout.totalSpreads - 1;
    const canGoPrev = !isFirstSpread || hasPrevChapter;
    const canGoNext = !isLastSpread || hasNextChapter;

    function triggerTurn(dir) {
        if (flip) return;
        if (dir === "prev") {
            if (spreadIndex > 0) {
                if (isTwoPage && layout.viewportWidth > 0) {
                    setFlip({ dir: "prev", from: spreadIndex, to: spreadIndex - 1 });
                } else {
                    setSpreadIndex((s) => s - 1);
                }
            } else if (hasPrevChapter) {
                onPrevChapter();
            }
        } else {
            if (spreadIndex < layout.totalSpreads - 1) {
                if (isTwoPage && layout.viewportWidth > 0) {
                    setFlip({ dir: "next", from: spreadIndex, to: spreadIndex + 1 });
                } else {
                    setSpreadIndex((s) => s + 1);
                }
            } else if (hasNextChapter) {
                onNextChapter();
            }
        }
    }

    // Turn spreads with Left / Right arrow keys
    useEffect(() => {
        function handleKeyDown(e) {
            if (tocOpen || menuOpen || flip) return;
            if (e.key === "ArrowLeft") {
                triggerTurn("prev");
            } else if (e.key === "ArrowRight") {
                triggerTurn("next");
            }
        }

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    });

    const leftPageNum = isTwoPage ? activeSpread * 2 + 1 : activeSpread + 1;
    const rightPageNum = activeSpread * 2 + 2;
    const halfWidth = layout.viewportWidth / 2;

    const trackBaseProps = {
        stride,
        columns: layout.columns,
        gap: layout.gap,
        viewportWidth: layout.viewportWidth,
        htmlStartsWithHeading,
        chapter,
        fontSize,
        isRealDeskSpread,
        themeStyles,
    };

    const readingBody = (
        <div
            style={isRealDeskSpread ? world.pageBox : undefined}
            className={`${
                isRealDeskSpread
                    ? "absolute z-10 flex flex-col"
                    : isFramed
                    ? "relative flex flex-col"
                    : "relative flex flex-col h-[calc(100vh-155px)] min-h-[420px]"
            } ${isRealDeskSpread ? themeStyles.inkText : ""}`}
        >
            {/* Hover Side Chevrons over Outer Page Margins */}
            {canGoPrev && (
                <button
                    type="button"
                    onClick={() => triggerTurn("prev")}
                    aria-label={isFirstSpread ? "Previous chapter" : "Previous page"}
                    className={`hidden md:flex absolute inset-y-8 ${
                        isRealDeskSpread ? "-left-9" : "-left-7"
                    } w-9 z-30 items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer`}
                >
                    <span
                        className={`h-10 w-7 rounded-full border flex items-center justify-center text-base shadow-sm ${themeStyles.surface} ${themeStyles.border}`}
                    >
                        ‹
                    </span>
                </button>
            )}

            {canGoNext && (
                <button
                    type="button"
                    onClick={() => triggerTurn("next")}
                    aria-label={isLastSpread ? "Next chapter" : "Next page"}
                    className={`hidden md:flex absolute inset-y-8 ${
                        isRealDeskSpread ? "-right-9" : "-right-7"
                    } w-9 z-30 items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer`}
                >
                    <span
                        className={`h-10 w-7 rounded-full border flex items-center justify-center text-base shadow-sm ${themeStyles.surface} ${themeStyles.border}`}
                    >
                        ›
                    </span>
                </button>
            )}

            {/* Running Header Separated Cleanly per Left & Right Physical Page */}
            <div
                className={`${
                    isRealDeskSpread ? "mb-2 text-[9.5px] tracking-[0.18em]" : "mb-3 text-[11px] tracking-widest"
                } flex items-center justify-between gap-8 font-serif uppercase opacity-65`}
            >
                <span className="truncate w-[44%] text-left">{bookTitle}</span>
                <span className="truncate w-[44%] text-right">
                    Ch. {chapter.chapterIndex + 1} • {chapter.title}
                </span>
            </div>

            {/* Paginated Multi-Column Viewport */}
            <div
                ref={viewportRef}
                style={{
                    perspective: "1800px",
                    "--book-img-max-h": `${layout.imgMaxHeight}px`,
                }}
                className={`relative overflow-hidden select-text ${
                    isFramed
                        ? "h-[calc(100vh-190px)] min-h-[420px] w-full"
                        : "flex-1 min-h-0 w-full"
                }`}
            >
                {/* Center Spine Crease Shading */}
                {isFramed && isTwoPage && (
                    <>
                        <div
                            aria-hidden="true"
                            className="pointer-events-none absolute inset-y-0 left-0 w-1/2 z-10 bg-gradient-to-r from-black/[0.03] via-transparent to-black/[0.07]"
                        />
                        <div
                            aria-hidden="true"
                            className="pointer-events-none absolute inset-y-0 right-0 w-1/2 z-10 bg-gradient-to-l from-black/[0.03] via-transparent to-black/[0.07]"
                        />
                        <div
                            aria-hidden="true"
                            className="pointer-events-none absolute inset-y-0 left-1/2 -translate-x-1/2 z-30 w-10 flex justify-center bg-gradient-to-r from-transparent via-black/[0.08] to-transparent"
                        >
                            <div className={`w-px h-full border-r opacity-70 ${themeStyles.border}`} />
                        </div>
                    </>
                )}

                {!flip ? (
                    <>
                        <ChapterTrack
                            trackRef={contentRef}
                            {...trackBaseProps}
                            spread={spreadIndex}
                        />

                        {isTwoPage && isLastSpread && rightPageEmpty && (
                            <div className="absolute inset-y-0 right-0 w-1/2 pl-8 flex flex-col items-center justify-center p-6 text-center z-20">
                                <span className="font-serif text-2xl mb-2 opacity-70">❦</span>
                                <p className="text-xs font-sans uppercase tracking-widest opacity-70">
                                    End of Chapter {chapter.chapterIndex + 1}
                                </p>
                                {hasNextChapter && (
                                    <>
                                        <p className="mt-2 font-serif text-base font-medium max-w-xs line-clamp-2">
                                            Up next: {nextChapterTitle}
                                        </p>
                                        <button
                                            type="button"
                                            onClick={onNextChapter}
                                            className="mt-5 min-h-11 rounded-control bg-forest px-5 text-sm font-medium text-white transition hover:bg-forest-hover shadow-sm font-sans cursor-pointer"
                                        >
                                            Continue Reading →
                                        </button>
                                    </>
                                )}
                            </div>
                        )}
                    </>
                ) : (
                    /* Active 3D Physical Leaf-Flip View */
                    <div className="relative h-full w-full" style={{ transformStyle: "preserve-3d" }}>
                        {/* Base Left Half */}
                        <div className="absolute inset-y-0 left-0 w-1/2 overflow-hidden">
                            <ChapterTrack
                                {...trackBaseProps}
                                spread={flip.dir === "next" ? flip.from : flip.to}
                            />
                        </div>

                        {/* Base Right Half */}
                        <div className="absolute inset-y-0 right-0 w-1/2 overflow-hidden">
                            <ChapterTrack
                                {...trackBaseProps}
                                offsetLeft={-halfWidth}
                                spread={flip.dir === "next" ? flip.to : flip.from}
                            />
                        </div>

                        {/* Dynamic Shadow Sweeping Across Underlying Pages */}
                        <div
                            aria-hidden="true"
                            className="pointer-events-none absolute inset-0 bg-black animate-book-shadow-sweep z-10"
                        />

                        {/* Rotating 3D Paper Sheet Hinged at Center Book Spine */}
                        <div
                            style={{
                                transformStyle: "preserve-3d",
                                transformOrigin: flip.dir === "next" ? "left center" : "right center",
                            }}
                            className={`absolute inset-y-0 w-1/2 z-20 ${
                                flip.dir === "next"
                                    ? "left-1/2 animate-book-flip-next"
                                    : "left-0 animate-book-flip-prev"
                            }`}
                        >
                            <div
                                style={{ backfaceVisibility: "hidden" }}
                                className="absolute inset-0 overflow-hidden shadow-2xl"
                            >
                                <TurningLeafSurface world={world} isFramed={isFramed} themeStyles={themeStyles}>
                                    <ChapterTrack
                                        {...trackBaseProps}
                                        offsetLeft={flip.dir === "next" ? -halfWidth : 0}
                                        spread={flip.from}
                                    />
                                </TurningLeafSurface>
                            </div>

                            <div
                                style={{
                                    backfaceVisibility: "hidden",
                                    transform: "rotateY(180deg)",
                                }}
                                className="absolute inset-0 overflow-hidden shadow-2xl"
                            >
                                <TurningLeafSurface world={world} isFramed={isFramed} themeStyles={themeStyles}>
                                    <ChapterTrack
                                        {...trackBaseProps}
                                        offsetLeft={flip.dir === "next" ? 0 : -halfWidth}
                                        spread={flip.to}
                                    />
                                </TurningLeafSurface>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Real Book Mode: Quiet Printed Corner Page Numbers ONLY (No Horizontal Divider Line!) */}
            {isRealDeskSpread ? (
                <div className="mt-1 flex items-center justify-between font-serif text-xs opacity-65 pointer-events-none">
                    <span>{leftPageNum}</span>
                    <span>{rightPageNum}</span>
                </div>
            ) : (
                /* Framed / Mobile Bottom Controls (Split Left & Right Without Spine-Crossing Line) */
                <footer className="mt-3 pt-1 flex items-center justify-between gap-2 font-sans text-xs">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            disabled={!canGoPrev}
                            onClick={() => triggerTurn("prev")}
                            className={`min-h-10 rounded-control px-3 font-medium transition ${themeStyles.hoverItem} disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer`}
                        >
                            {isFirstSpread ? "← Prev Chapter" : "‹ Turn Back"}
                        </button>
                        <span className="hidden sm:inline font-serif opacity-70">{leftPageNum}</span>
                    </div>

                    <span className="text-[11px] tracking-wide opacity-60">
                        Spread {activeSpread + 1} / {layout.totalSpreads}
                    </span>

                    <div className="flex items-center gap-3">
                        {isTwoPage && <span className="hidden sm:inline font-serif opacity-70">{rightPageNum}</span>}
                        <button
                            type="button"
                            disabled={!canGoNext}
                            onClick={() => triggerTurn("next")}
                            className={`min-h-10 rounded-control px-3 font-medium transition ${themeStyles.accentText} ${themeStyles.hoverItem} disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer`}
                        >
                            {isLastSpread ? "Next Chapter →" : "Turn Page ›"}
                        </button>
                    </div>
                </footer>
            )}
        </div>
    );

    const outerWrapperClass = isRealDeskSpread
        ? `relative w-full h-[calc(100vh-65px)] overflow-hidden select-none flex items-center justify-center ${world.stageBg}`
        : "w-full px-2 sm:px-3 pt-1.5 pb-6 select-none";

    return (
        <div className={outerWrapperClass}>
            {/* Stage Container: Full-Width Framed Book | Full-Viewport Desk Book | Mobile Leaf */}
            <div
                className={
                    isFramed
                        ? "mx-auto w-full"
                        : isDesktop
                        ? "relative mx-auto overflow-hidden shadow-[0_24px_70px_-10px_rgba(0,0,0,0.85)]"
                        : `relative mx-auto w-full rounded-r-2xl rounded-l-md border border-l-[10px] shadow-xl p-4 ${
                              themeStyles.isDark ? `${themeStyles.surface} ${themeStyles.border}` : world.mobileCard
                          }`
                }
                style={
                    isRealDeskSpread
                        ? {
                              width: `min(100vw, calc((100vh - 66px) * ${world.aspect}))`,
                              height: `min(calc(100vh - 66px), calc(100vw / ${world.aspect}))`,
                          }
                        : undefined
                }
            >
                {/* Original Clean Framed Book (Matte Black Hardcover & Charcoal Ribbon) */}
                {isFramed && (
                    <div className="relative rounded-[22px] p-2 sm:p-2.5 shadow-[0_26px_65px_-15px_rgba(0,0,0,0.65)] bg-gradient-to-b from-[#232529] via-[#141518] to-[#08090B] ring-1 ring-white/10">
                        <div
                            aria-hidden="true"
                            className="bookmark-ribbon pointer-events-none absolute -bottom-5 left-1/2 translate-x-4 w-4 h-7 shadow-md z-10 bg-gradient-to-b from-[#3B3F47] to-[#1D2025]"
                        />
                        <div
                            className={`relative rounded-[14px] border-y border-x-[6px] border-double shadow-inner px-4 py-3 sm:px-8 sm:py-3.5 ${themeStyles.surface} ${themeStyles.border}`}
                        >
                            {readingBody}
                        </div>
                    </div>
                )}

                {/* Real Desk Open Book Stage & Mobile Card */}
                {!isFramed && (
                    <>
                        {!isDesktop && (
                            <div
                                aria-hidden="true"
                                className={`bookmark-ribbon pointer-events-none absolute -bottom-4 right-8 w-3.5 h-6 shadow ${world.mobileRibbon}`}
                            />
                        )}

                        {isDesktop && (
                            <>
                                <img
                                    src={themeStyles.isDark ? world.darkImage : world.image}
                                    alt={world.alt}
                                    draggable={false}
                                    className="pointer-events-none absolute inset-0 h-full w-full object-fill transition duration-300"
                                />

                                {world.ornateCorners && (
                                    <div
                                        className={`pointer-events-none transition duration-300 ${
                                            themeStyles.isDark ? "opacity-50" : "opacity-95"
                                        }`}
                                    >
                                        <OrnateCornerClasp positionClass="top-[2.8%] left-[2.8%]" />
                                        <OrnateCornerClasp positionClass="top-[2.8%] right-[2.8%] scale-x-[-1]" />
                                        <OrnateCornerClasp positionClass="bottom-[6.0%] left-[2.8%] scale-y-[-1]" />
                                        <OrnateCornerClasp positionClass="bottom-[6.0%] right-[2.8%] scale-x-[-1] scale-y-[-1]" />
                                    </div>
                                )}
                            </>
                        )}

                        {readingBody}
                    </>
                )}
            </div>

            {/* Real Desk Mode: Slim Translucent Navigation Pill Floating on Bottom Desk Rim */}
            {isRealDeskSpread && (
                <div
                    className={`absolute bottom-1.5 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 rounded-full border px-3.5 py-0.5 text-[11px] font-sans backdrop-blur-md shadow-md opacity-85 hover:opacity-100 transition-opacity ${themeStyles.surface} ${themeStyles.border}`}
                >
                    <button
                        type="button"
                        disabled={!canGoPrev}
                        onClick={() => triggerTurn("prev")}
                        className={`min-h-7 rounded-full px-2 font-medium transition ${themeStyles.hoverItem} disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer`}
                    >
                        {isFirstSpread ? "← Prev Chapter" : "‹ Turn Back"}
                    </button>
                    <span className={`text-[11px] tracking-wide ${themeStyles.muted}`}>
                        Spread {activeSpread + 1} / {layout.totalSpreads}
                    </span>
                    <button
                        type="button"
                        disabled={!canGoNext}
                        onClick={() => triggerTurn("next")}
                        className={`min-h-7 rounded-full px-2 font-medium transition ${themeStyles.accentText} ${themeStyles.hoverItem} disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer`}
                    >
                        {isLastSpread ? "Next Chapter →" : "Turn Page ›"}
                    </button>
                </div>
            )}
        </div>
    );
}
