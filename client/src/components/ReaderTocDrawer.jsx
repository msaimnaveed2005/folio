import { useEffect, useRef } from "react";

export default function ReaderTocDrawer({
    isOpen,
    onClose,
    bookTitle,
    chapters,
    activeChapterId,
    onSelectChapter,
    themeStyles,
}) {
    const activeItemRef = useRef(null);

    useEffect(() => {
        if (isOpen && activeItemRef.current) {
            activeItemRef.current.scrollIntoView({ block: "center" });
        }
    }, [isOpen, activeChapterId]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <div
                onClick={onClose}
                className="fixed inset-0 bg-black/40 backdrop-blur-xs"
                aria-hidden="true"
            />

            {/* Drawer Panel */}
            <aside
                className={`relative z-10 flex h-full w-80 max-w-[85vw] flex-col border-r shadow-xl ${themeStyles.surface} ${themeStyles.border}`}
            >
                <div className={`flex items-center justify-between border-b px-4 py-3 ${themeStyles.border}`}>
                    <div className="min-w-0">
                        <p className={`text-[11px] font-semibold uppercase tracking-wider ${themeStyles.muted}`}>
                            Table of Contents
                        </p>
                        <h2 className="font-serif text-base font-semibold truncate">{bookTitle}</h2>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close table of contents"
                        className={`min-h-11 min-w-11 flex items-center justify-center rounded-control ${themeStyles.hoverItem}`}
                    >
                        ✕
                    </button>
                </div>

                <nav className="flex-1 overflow-y-auto">
                    {chapters.map((ch) => {
                        const isActive = ch._id === activeChapterId;
                        return (
                            <button
                                key={ch._id}
                                ref={isActive ? activeItemRef : null}
                                type="button"
                                onClick={() => {
                                    onSelectChapter(ch._id);
                                    onClose();
                                }}
                                className={`w-full min-h-11 flex items-center justify-between gap-3 border-b px-4 py-3 text-left text-sm transition ${themeStyles.border} ${isActive ? themeStyles.activeItem : themeStyles.hoverItem
                                    }`}
                            >
                                <span className="line-clamp-2">{ch.title}</span>
                                <span className={`shrink-0 text-xs ${isActive ? themeStyles.accentText : themeStyles.muted}`}>
                                    {ch.unitCount}u
                                </span>
                            </button>
                        );
                    })}
                </nav>
            </aside>
        </div>
    );
}