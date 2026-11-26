const THEME_OPTIONS = [
    { id: "light", label: "Paper", swatch: "bg-[#F8F6F1] text-[#202A25]" },
    { id: "sepia", label: "Sepia", swatch: "bg-[#F1E7D3] text-[#3D2E1E]" },
    { id: "sage", label: "Sage", swatch: "bg-[#E8EFEA] text-[#1D2C24]" },
    { id: "dusk", label: "Dusk", swatch: "bg-[#222831] text-[#D8DEE9]" },
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
                className={`absolute right-4 top-16 z-50 w-80 max-w-[calc(100vw-2rem)] rounded-card border p-4 shadow-xl space-y-4 ${themeStyles.surface} ${themeStyles.border}`}
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
            </div>
        </>
    );
}