const THEME_OPTIONS = [
    { id: "light", label: "Paper", swatch: "bg-[#F8F6F1] text-[#202A25]" },
    { id: "solarized", label: "Solarized", swatch: "bg-[#FDF6E3] text-[#3B4D54]" },
    { id: "sepia", label: "Sepia", swatch: "bg-[#F1E7D3] text-[#3D2E1E]" },
    { id: "sage", label: "Sage", swatch: "bg-[#E8EFEA] text-[#1D2C24]" },
    { id: "vintage", label: "Vintage", swatch: "bg-[#EAE4D2] text-[#2B2E33]" },
    { id: "dusk", label: "Dusk", swatch: "bg-[#222831] text-[#D8DEE9]" },
    { id: "gruvbox", label: "Gruvbox", swatch: "bg-[#282828] text-[#EBDBB2]" },
    { id: "rosepine", label: "Rosé Pine", swatch: "bg-[#191724] text-[#E0DEF4]" },
    { id: "dark", label: "Dark", swatch: "bg-[#121B18] text-[#DCE7E1]" },
];

const FONT_OPTIONS = [
    { id: "serif", label: "Literata", className: "font-serif" },
    { id: "cormorant", label: "Cormorant", className: "font-cormorant" },
    { id: "lora", label: "Lora", className: "font-lora" },
    { id: "merriweather", label: "Merriweather", className: "font-merriweather" },
    { id: "crimson", label: "Crimson Pro", className: "font-crimson" },
    { id: "atkinson", label: "Atkinson", className: "font-atkinson" },
    { id: "sans", label: "Inter", className: "font-sans" },
];

const LAYOUT_OPTIONS = [
    { id: "scroll", label: "Scroll" },
    { id: "spread", label: "2-Page Book" },
];

const BOOK_STYLE_OPTIONS = [
    { id: "framed", label: "Clean Framed Book (Original)", swatch: "bg-[#F8F6F1] border-[#141518]", spanFull: true },
    { id: "classic", label: "Classic Novel", swatch: "bg-[#5A3825] border-[#D4AF37]/60" },
    { id: "fantasy", label: "Fantasy Tome", swatch: "bg-[#1D2448] border-[#D4AF37]" },
    { id: "journal", label: "Life Improvement", swatch: "bg-[#476150] border-[#B65E3D]" },
    { id: "minimal", label: "Modern Minimal", swatch: "bg-[#333840] border-[#94A3B8]" },
];

export default function ReaderAppearanceMenu({
    isOpen,
    onClose,
    prefs,
    onUpdatePrefs,
    themeStyles,
}) {
    if (!isOpen) return null;

    return (
        <>
            {/* Click-outside backdrop */}
            <div className="fixed inset-0 z-40" onClick={onClose} aria-hidden="true" />

            <div
                className={`absolute right-4 top-16 z-50 w-80 max-w-[calc(100vw-2rem)] max-h-[75vh] overflow-y-auto rounded-card border p-4 shadow-xl space-y-4 ${themeStyles.surface} ${themeStyles.border}`}
            >
                {/* 1. Theme Selector */}
                <div>
                    <p className={`mb-2 text-xs font-semibold uppercase tracking-wider ${themeStyles.muted}`}>
                        Theme
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                        {THEME_OPTIONS.map((opt) => {
                            const active = prefs.theme === opt.id;
                            return (
                                <button
                                    key={opt.id}
                                    type="button"
                                    onClick={() => onUpdatePrefs({ theme: opt.id })}
                                    className={`min-h-11 rounded-control border text-xs font-medium transition ${opt.swatch} ${active ? themeStyles.activeRing : themeStyles.border
                                        }`}
                                >
                                    {opt.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* 2. Font Family */}
                <div>
                    <p className={`mb-2 text-xs font-semibold uppercase tracking-wider ${themeStyles.muted}`}>
                        Typeface
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                        {FONT_OPTIONS.map((font) => {
                            const active = prefs.fontFamily === font.id;
                            return (
                                <button
                                    key={font.id}
                                    type="button"
                                    onClick={() => onUpdatePrefs({ fontFamily: font.id })}
                                    className={`min-h-11 rounded-control border px-2 text-sm font-medium transition ${font.className} ${active
                                        ? themeStyles.activeChip
                                        : `${themeStyles.border} ${themeStyles.hoverItem}`
                                        }`}
                                >
                                    {font.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* 3. Font Size */}
                <div>
                    <p className={`mb-2 text-xs font-semibold uppercase tracking-wider ${themeStyles.muted}`}>
                        Font Size
                    </p>
                    <div className="flex items-center justify-between gap-2">
                        <button
                            type="button"
                            disabled={prefs.fontSize <= 14}
                            onClick={() => onUpdatePrefs({ fontSize: Math.max(14, prefs.fontSize - 2) })}
                            className={`min-h-11 flex-1 rounded-control border text-sm font-semibold disabled:opacity-40 ${themeStyles.border} ${themeStyles.hoverItem}`}
                        >
                            A-
                        </button>
                        <span className="w-14 text-center text-sm font-medium">{prefs.fontSize}px</span>
                        <button
                            type="button"
                            disabled={prefs.fontSize >= 24}
                            onClick={() => onUpdatePrefs({ fontSize: Math.min(24, prefs.fontSize + 2) })}
                            className={`min-h-11 flex-1 rounded-control border text-sm font-semibold disabled:opacity-40 ${themeStyles.border} ${themeStyles.hoverItem}`}
                        >
                            A+
                        </button>
                    </div>
                </div>

                {/* 4. Reading Layout */}
                <div>
                    <p className={`mb-2 text-xs font-semibold uppercase tracking-wider ${themeStyles.muted}`}>
                        Reading Layout
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                        {LAYOUT_OPTIONS.map((opt) => {
                            const active = (prefs.layout || "scroll") === opt.id;
                            return (
                                <button
                                    key={opt.id}
                                    type="button"
                                    onClick={() => onUpdatePrefs({ layout: opt.id })}
                                    className={`min-h-11 rounded-control border px-2 text-sm font-medium transition ${active
                                            ? themeStyles.activeChip
                                            : `${themeStyles.border} ${themeStyles.hoverItem}`
                                        }`}
                                >
                                    {opt.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* 5. Real Open-Book World (shown in 2-Page Book Mode) */}
                {(prefs.layout || "scroll") === "spread" && (
                    <div>
                        <p className={`mb-2 text-xs font-semibold uppercase tracking-wider ${themeStyles.muted}`}>
                            Book Scene
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                            {BOOK_STYLE_OPTIONS.map((style) => {
                                const active = (prefs.bookStyle || "classic") === style.id;
                                return (
                                    <button
                                        key={style.id}
                                        type="button"
                                        onClick={() => onUpdatePrefs({ bookStyle: style.id })}
                                        className={`min-h-11 rounded-control border px-2.5 text-xs font-medium transition flex items-center gap-2 text-left ${
                                            style.spanFull ? "col-span-2" : ""
                                        } ${
                                            active
                                                ? themeStyles.activeChip
                                                : `${themeStyles.border} ${themeStyles.hoverItem}`
                                        }`}
                                    >
                                        <span
                                            aria-hidden="true"
                                            className={`h-3.5 w-3.5 shrink-0 rounded-sm border ${style.swatch}`}
                                        />
                                        <span className="truncate">{style.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}