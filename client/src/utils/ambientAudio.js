export const AMBIENT_PRESETS = [
    { id: "soft-rain", title: "Soft Rain", subtitle: "Gentle rainfall & breeze" },
    { id: "warm-hearth", title: "Warm Hearth", subtitle: "Low fireplace embers & warmth" },
    { id: "deep-focus", title: "Deep Focus", subtitle: "Calm brown noise & subtle hum" },
    { id: "calm-study", title: "Calm Study Pad", subtitle: "Warm breathing ambient chord" },
];

/**
 * Generate a seamlessly looping pink or brown noise buffer with an equal-power
 * head/tail crossfade so loops never produce audible clicks.
 */
function createSeamlessNoiseBuffer(ctx, durationSec = 6, mode = "pink") {
    const length = Math.floor(ctx.sampleRate * durationSec);
    const fadeSamples = Math.floor(ctx.sampleRate * 0.4);
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    let b0 = 0;
    let b1 = 0;
    let b2 = 0;
    let b3 = 0;
    let b4 = 0;
    let b5 = 0;
    let b6 = 0;
    let brown = 0;

    for (let i = 0; i < length; i++) {
        const white = Math.random() * 2 - 1;
        if (mode === "brown") {
            brown = (brown + 0.02 * white) / 1.02;
            data[i] = brown * 3.2;
        } else {
            b0 = 0.99886 * b0 + white * 0.0555179;
            b1 = 0.99332 * b1 + white * 0.0750759;
            b2 = 0.96900 * b2 + white * 0.1538520;
            b3 = 0.86650 * b3 + white * 0.3104856;
            b4 = 0.55000 * b4 + white * 0.5329522;
            b5 = -0.7616 * b5 - white * 0.0168980;
            data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
            b6 = white * 0.115926;
        }
    }

    // Equal-power crossfade tail into head for click-free looping
    for (let i = 0; i < fadeSamples; i++) {
        const t = i / fadeSamples;
        const headGain = Math.sqrt(t);
        const tailGain = Math.sqrt(1 - t);
        data[i] = data[i] * headGain + data[length - fadeSamples + i] * tailGain;
    }

    return buffer;
}

/**
 * Sparse soft ember crackles for the Warm Hearth preset.
 */
function createCrackleBuffer(ctx, durationSec = 5) {
    const length = Math.floor(ctx.sampleRate * durationSec);
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let decay = 0;

    for (let i = 0; i < length; i++) {
        if (Math.random() < 0.00045) {
            decay = (Math.random() * 0.65 + 0.25) * (Math.random() < 0.5 ? 1 : -1);
        } else {
            decay *= 0.988;
        }
        data[i] = decay;
    }
    return buffer;
}

/**
 * Create a clean controllable Web Audio engine instance scoped to the Reader page.
 */
export function createAmbientEngine() {
    let ctx = null;
    let activeSources = [];
    let activeNodes = [];
    let masterGain = null;

    function ensureContext() {
        if (!ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            ctx = new AudioCtx();
        }
        if (ctx.state === "suspended") {
            ctx.resume();
        }
        return ctx;
    }

    function teardownGraph() {
        const sourcesToStop = activeSources;
        const nodesToFree = activeNodes;
        const prevGain = masterGain;

        activeSources = [];
        activeNodes = [];
        masterGain = null;

        if (ctx && prevGain) {
            const now = ctx.currentTime;
            prevGain.gain.cancelScheduledValues(now);
            prevGain.gain.setTargetAtTime(0.0001, now, 0.03);
        }

        setTimeout(() => {
            sourcesToStop.forEach((src) => {
                try {
                    src.stop();
                } catch {
                    // Ignore already stopped sources
                }
            });
            nodesToFree.forEach((node) => {
                try {
                    node.disconnect();
                } catch {
                    // Ignore disconnected nodes
                }
            });
        }, 140);
    }

    function play(presetId, volume = 0.5) {
        const audioCtx = ensureContext();
        teardownGraph();

        const rootGain = audioCtx.createGain();
        rootGain.gain.setValueAtTime(0.0001, audioCtx.currentTime);
        rootGain.connect(audioCtx.destination);
        masterGain = rootGain;

        const sources = [];
        const nodes = [rootGain];

        function addLoopSource(buffer, target, gainValue = 1) {
            const src = audioCtx.createBufferSource();
            src.buffer = buffer;
            src.loop = true;
            const g = audioCtx.createGain();
            g.gain.value = gainValue;
            src.connect(g);
            g.connect(target);
            src.start();
            sources.push(src);
            nodes.push(src, g);
            return src;
        }

        if (presetId === "soft-rain") {
            const pink = createSeamlessNoiseBuffer(audioCtx, 6, "pink");

            const airFilter = audioCtx.createBiquadFilter();
            airFilter.type = "bandpass";
            airFilter.frequency.value = 1050;
            airFilter.Q.value = 0.55;
            airFilter.connect(rootGain);

            const lfo = audioCtx.createOscillator();
            const lfoGain = audioCtx.createGain();
            lfo.frequency.value = 0.11;
            lfoGain.gain.value = 180;
            lfo.connect(lfoGain);
            lfoGain.connect(airFilter.frequency);
            lfo.start();
            sources.push(lfo);
            nodes.push(airFilter, lfo, lfoGain);

            const deepFilter = audioCtx.createBiquadFilter();
            deepFilter.type = "lowpass";
            deepFilter.frequency.value = 340;
            deepFilter.connect(rootGain);
            nodes.push(deepFilter);

            addLoopSource(pink, airFilter, 0.55);
            addLoopSource(pink, deepFilter, 0.45);
        } else if (presetId === "warm-hearth") {
            const brown = createSeamlessNoiseBuffer(audioCtx, 6, "brown");
            const crackle = createCrackleBuffer(audioCtx, 5);

            const rumbleFilter = audioCtx.createBiquadFilter();
            rumbleFilter.type = "lowpass";
            rumbleFilter.frequency.value = 260;
            rumbleFilter.connect(rootGain);

            const emberFilter = audioCtx.createBiquadFilter();
            emberFilter.type = "bandpass";
            emberFilter.frequency.value = 1750;
            emberFilter.Q.value = 1.1;
            emberFilter.connect(rootGain);
            nodes.push(rumbleFilter, emberFilter);

            addLoopSource(brown, rumbleFilter, 0.75);
            addLoopSource(crackle, emberFilter, 0.18);
        } else if (presetId === "deep-focus") {
            const brown = createSeamlessNoiseBuffer(audioCtx, 6, "brown");
            const padFilter = audioCtx.createBiquadFilter();
            padFilter.type = "lowpass";
            padFilter.frequency.value = 500;
            padFilter.connect(rootGain);
            nodes.push(padFilter);

            addLoopSource(brown, padFilter, 0.65);

            [110, 164.81].forEach((freq, idx) => {
                const osc = audioCtx.createOscillator();
                const g = audioCtx.createGain();
                osc.type = "sine";
                osc.frequency.value = freq;
                g.gain.value = idx === 0 ? 0.032 : 0.018;
                osc.connect(g);
                g.connect(rootGain);
                osc.start();
                sources.push(osc);
                nodes.push(osc, g);
            });
        } else {
            // calm-study: gentle filtered Cmaj9 ambient pad
            const padFilter = audioCtx.createBiquadFilter();
            padFilter.type = "lowpass";
            padFilter.frequency.value = 580;
            padFilter.connect(rootGain);

            const lfo = audioCtx.createOscillator();
            const lfoGain = audioCtx.createGain();
            lfo.frequency.value = 0.07;
            lfoGain.gain.value = 160;
            lfo.connect(lfoGain);
            lfoGain.connect(padFilter.frequency);
            lfo.start();
            sources.push(lfo);
            nodes.push(padFilter, lfo, lfoGain);

            const notes = [
                { freq: 130.81, gain: 0.07 },
                { freq: 196.0, gain: 0.05 },
                { freq: 246.94, gain: 0.035 },
                { freq: 293.66, gain: 0.025 },
            ];
            notes.forEach(({ freq, gain }) => {
                const osc = audioCtx.createOscillator();
                const g = audioCtx.createGain();
                osc.type = "triangle";
                osc.frequency.value = freq;
                g.gain.value = gain;
                osc.connect(g);
                g.connect(padFilter);
                osc.start();
                sources.push(osc);
                nodes.push(osc, g);
            });
        }

        activeSources = sources;
        activeNodes = nodes;
        rootGain.gain.setTargetAtTime(Math.max(0.0001, volume * 0.65), audioCtx.currentTime, 0.08);
    }

    function setVolume(volume) {
        if (ctx && masterGain) {
            masterGain.gain.setTargetAtTime(
                Math.max(0.0001, volume * 0.65),
                ctx.currentTime,
                0.05
            );
        }
    }

    function stop() {
        teardownGraph();
    }

    function dispose() {
        teardownGraph();
        const currentCtx = ctx;
        ctx = null;
        if (currentCtx && currentCtx.state !== "closed") {
            setTimeout(() => {
                currentCtx.close().catch(() => {});
            }, 180);
        }
    }

    return { play, setVolume, stop, dispose };
}
