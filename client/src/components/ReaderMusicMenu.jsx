import { useRef } from "react";
import { AMBIENT_PRESETS } from "../utils/ambientAudio";

function formatMb(bytes) {
    if (!bytes) return "";
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ReaderMusicMenu({
    isOpen,
    onClose,
    themeStyles,
    musicSource,
    isPlaying,
    isLoadingTrack,
    volume,
    tracks,
    uploading,
    error,
    onTogglePlay,
    onSelectPreset,
    onSelectCustomTrack,
    onVolumeChange,
    onUploadTrack,
    onDeleteTrack,
}) {
    const fileInputRef = useRef(null);

    if (!isOpen) return null;

    const activePreset =
        musicSource.kind === "preset"
            ? AMBIENT_PRESETS.find((p) => p.id === musicSource.id)
            : null;
    const activeCustom =
        musicSource.kind === "custom"
            ? tracks.find((t) => t._id === musicSource.id)
            : null;
    const activeTitle =
        activePreset?.title || activeCustom?.title || musicSource.title || "Soft Rain";

    function handleFilePicked(e) {
        const file = e.target.files?.[0];
        e.target.value = "";
        if (file) {
            onUploadTrack(file);
        }
    }

    return (
        <>
            <div className="fixed inset-0 z-30" onClick={onClose} aria-hidden="true" />

            <div
                role="dialog"
                aria-label="Reading music settings"
                className={`fixed top-16 right-4 z-40 w-80 sm:w-96 max-h-[calc(100vh-5.5rem)] overflow-y-auto rounded-card border p-5 shadow-2xl space-y-5 font-sans ${themeStyles.surface} ${themeStyles.border}`}
            >
                {/* Header & Main Play/Pause + Volume */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                            <p
                                className={`text-[11px] font-semibold uppercase tracking-wider ${themeStyles.muted}`}
                            >
                                Reading Audio
                            </p>
                            <p className="truncate text-sm font-semibold">{activeTitle}</p>
                        </div>

                        <button
                            type="button"
                            onClick={onTogglePlay}
                            disabled={isLoadingTrack}
                            className="min-h-10 shrink-0 rounded-control bg-forest px-4 text-xs font-medium text-white transition hover:bg-forest-hover disabled:opacity-50 cursor-pointer"
                        >
                            {isLoadingTrack ? "Loading..." : isPlaying ? "Pause" : "Play"}
                        </button>
                    </div>

                    <div className="flex items-center gap-3">
                        <span className={`text-xs ${themeStyles.muted}`}>Vol</span>
                        <input
                            type="range"
                            min={0}
                            max={1}
                            step={0.02}
                            value={volume}
                            aria-label="Reading music volume"
                            onChange={(e) => onVolumeChange(Number(e.target.value))}
                            className="w-full accent-[#2D5B4B] cursor-pointer"
                        />
                        <span className={`w-9 text-right text-xs tabular-nums ${themeStyles.muted}`}>
                            {Math.round(volume * 100)}%
                        </span>
                    </div>
                </div>

                {error && (
                    <p className="rounded-control border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-500">
                        {error}
                    </p>
                )}

                {/* Built-in Offline Ambient Soundscapes */}
                <div>
                    <p
                        className={`mb-2 text-xs font-semibold uppercase tracking-wider ${themeStyles.muted}`}
                    >
                        Ambient Soundscapes
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                        {AMBIENT_PRESETS.map((preset) => {
                            const selected =
                                musicSource.kind === "preset" && musicSource.id === preset.id;
                            return (
                                <button
                                    key={preset.id}
                                    type="button"
                                    onClick={() => onSelectPreset(preset.id)}
                                    className={`min-h-11 rounded-control border px-2.5 py-2 text-left transition cursor-pointer ${
                                        selected
                                            ? themeStyles.activeChip
                                            : `${themeStyles.border} ${themeStyles.hoverItem}`
                                    }`}
                                >
                                    <span className="block text-xs font-medium leading-tight">
                                        {preset.title}
                                    </span>
                                    <span
                                        className={`mt-0.5 block truncate text-[10px] ${themeStyles.muted}`}
                                    >
                                        {preset.subtitle}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Personal Uploaded Audio Tracks */}
                <div>
                    <div className="mb-2 flex items-center justify-between gap-2">
                        <p
                            className={`text-xs font-semibold uppercase tracking-wider ${themeStyles.muted}`}
                        >
                            Your Tracks
                        </p>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".mp3,.wav,.ogg,.m4a,audio/*"
                            onChange={handleFilePicked}
                            className="hidden"
                        />
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                            className={`min-h-8 rounded-control border px-2.5 text-xs font-medium transition cursor-pointer ${themeStyles.border} ${themeStyles.hoverItem} disabled:opacity-50`}
                        >
                            {uploading ? "Uploading..." : "+ Upload Audio"}
                        </button>
                    </div>

                    {tracks.length === 0 ? (
                        <p
                            className={`rounded-control border border-dashed px-3 py-3 text-center text-xs ${themeStyles.border} ${themeStyles.muted}`}
                        >
                            Upload .mp3, .wav, .ogg, or .m4a (max 25 MB) to keep your own study
                            tracks saved.
                        </p>
                    ) : (
                        <ul className="space-y-1.5">
                            {tracks.map((track) => {
                                const selected =
                                    musicSource.kind === "custom" && musicSource.id === track._id;
                                return (
                                    <li
                                        key={track._id}
                                        className={`flex items-center justify-between gap-2 rounded-control border px-2.5 py-1.5 transition ${
                                            selected ? themeStyles.activeChip : themeStyles.border
                                        }`}
                                    >
                                        <button
                                            type="button"
                                            onClick={() => onSelectCustomTrack(track)}
                                            className="min-w-0 flex-1 text-left cursor-pointer"
                                        >
                                            <span className="block truncate text-xs font-medium">
                                                {track.title}
                                            </span>
                                            <span className={`block text-[10px] ${themeStyles.muted}`}>
                                                {formatMb(track.fileSize)}
                                            </span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => onDeleteTrack(track._id)}
                                            aria-label={`Delete ${track.title}`}
                                            className={`min-h-7 min-w-7 rounded-control px-1.5 text-xs transition ${themeStyles.muted} hover:text-red-500 cursor-pointer`}
                                        >
                                            ✕
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            </div>
        </>
    );
}
