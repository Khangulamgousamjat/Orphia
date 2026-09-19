/**
 * Advanced Procedural Audio & Music Synthesis Engine for Orphia
 * Generates rich, diverse, polyphonic musical WAV audio with studio-quality warmth.
 * Pure musical additive synthesis with ZERO digital aliasing or radio static.
 */

export interface SynthOptions {
  prompt: string;
  duration?: number;
  creativity?: number; // 0.0 to 1.0
  complexity?: number; // 0.0 to 1.0
}

export interface SampleTransformOptions {
  sampleBuffer: Buffer;
  prompt?: string;
  duration?: number;
  sampleInfluence?: number; // 0 to 100
  transformationStyle?: number; // 0 to 100
}

// ----------------------------------------------------------------------
// Seeded PRNG & String Hashing
// ----------------------------------------------------------------------

function hashString(str: string): number {
  let hash = 2166136261;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function createPrng(seed: number) {
  let s = seed >>> 0;
  return function () {
    let t = (s += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ----------------------------------------------------------------------
// Musical Frequencies (Hz)
// ----------------------------------------------------------------------

function midiToFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

const SEMITONES: Record<string, number> = {
  C: 0,
  "C#": 1,
  Db: 1,
  D: 2,
  "D#": 3,
  Eb: 3,
  E: 4,
  F: 5,
  "F#": 6,
  Gb: 6,
  G: 7,
  "G#": 8,
  Ab: 8,
  A: 9,
  "A#": 10,
  Bb: 10,
  B: 11,
};

// ----------------------------------------------------------------------
// Clean Additive Oscillators (Zero Aliasing, Zero Radio Static)
// ----------------------------------------------------------------------

/**
 * Struck-string acoustic piano tone (harmonic overtone series with hammer attack & organic decay)
 */
function pianoTone(f: number, t: number, noteTime: number): number {
  if (noteTime < 0) return 0;
  const attack = Math.min(1, noteTime / 0.006);
  // Hammer strike initial decay + warm resonant sustain
  const decay =
    (0.55 * Math.exp(-noteTime * 3.5) + 0.45 * Math.exp(-noteTime * 0.75)) *
    attack;

  const tone =
    Math.sin(2 * Math.PI * f * t) * 0.62 +
    Math.sin(4 * Math.PI * f * t) * 0.24 +
    Math.sin(6 * Math.PI * f * t) * 0.09 +
    Math.sin(8 * Math.PI * f * t) * 0.04 +
    Math.sin(10 * Math.PI * f * t) * 0.01;

  return tone * decay;
}

/**
 * Warm Rhodes Electric Piano (rich sine + 2nd harmonic + subtle stereo chorus)
 */
function rhodesTone(f: number, t: number, noteTime: number): number {
  if (noteTime < 0) return 0;
  const attack = Math.min(1, noteTime / 0.01);
  const decay = Math.exp(-noteTime * 1.6) * attack;

  const tremolo = 1 + 0.08 * Math.sin(2 * Math.PI * 4.5 * t);
  const tone =
    Math.sin(2 * Math.PI * f * t) * 0.7 +
    Math.sin(4 * Math.PI * f * t) * 0.22 +
    Math.sin(6 * Math.PI * f * t) * 0.08;

  return tone * decay * tremolo;
}

/**
 * Lush Cinematic String Pad (3 detuned voices for warm chorus width)
 */
function stringsTone(f: number, t: number): number {
  return (
    Math.sin(2 * Math.PI * f * t) * 0.5 +
    Math.sin(2 * Math.PI * (f * 1.0025) * t) * 0.25 +
    Math.sin(2 * Math.PI * (f * 0.9975) * t) * 0.25
  );
}

/**
 * Warm Synth Pad (Additive band-limited saw simulation, smooth and warm)
 */
function warmSynthTone(f: number, t: number): number {
  // Band-limited 4-harmonic saw
  return (
    Math.sin(2 * Math.PI * f * t) * 0.5 +
    Math.sin(4 * Math.PI * f * t) * 0.25 +
    Math.sin(6 * Math.PI * f * t) * 0.15 +
    Math.sin(8 * Math.PI * f * t) * 0.1
  );
}

/**
 * Acoustic Pluck / Guitar
 */
function pluckTone(f: number, t: number, noteTime: number): number {
  if (noteTime < 0) return 0;
  const attack = Math.min(1, noteTime / 0.004);
  const decay = Math.exp(-noteTime * 6.5) * attack;
  return (
    (Math.sin(2 * Math.PI * f * t) * 0.65 +
      Math.sin(4 * Math.PI * f * t) * 0.25 +
      Math.sin(6 * Math.PI * f * t) * 0.1) *
    decay
  );
}

// ----------------------------------------------------------------------
// Genre & Mood Classification
// ----------------------------------------------------------------------

export type GenreType =
  | "calm_piano"
  | "synthwave"
  | "lofi"
  | "cinematic"
  | "edm"
  | "rock"
  | "acoustic"
  | "ambient"
  | "jazz"
  | "trap"
  | "pop"
  | "chill";

interface GenreProfile {
  bpm: number;
  scaleType: "minor" | "major" | "dorian" | "harmonic_minor" | "pentatonic";
  drumStyle: "none" | "warm_beat" | "four_on_floor" | "rock" | "synth";
  bassStyle: "piano" | "warm" | "sub" | "walking" | "drive";
  leadTimbre: "piano" | "rhodes" | "strings" | "synth" | "pluck";
  defaultChords: { root: string; type: "m" | "maj" | "m7" | "maj7" | "sus4" | "dim" }[];
}

const GENRE_PROFILES: Record<GenreType, GenreProfile> = {
  calm_piano: {
    bpm: 68,
    scaleType: "major",
    drumStyle: "none",
    bassStyle: "piano",
    leadTimbre: "piano",
    defaultChords: [
      { root: "C", type: "maj7" },
      { root: "G", type: "maj" },
      { root: "A", type: "m7" },
      { root: "F", type: "maj7" },
    ],
  },
  synthwave: {
    bpm: 118,
    scaleType: "dorian",
    drumStyle: "synth",
    bassStyle: "drive",
    leadTimbre: "synth",
    defaultChords: [
      { root: "A", type: "m7" },
      { root: "F", type: "maj7" },
      { root: "G", type: "maj" },
      { root: "E", type: "m" },
    ],
  },
  lofi: {
    bpm: 78,
    scaleType: "minor",
    drumStyle: "warm_beat",
    bassStyle: "warm",
    leadTimbre: "rhodes",
    defaultChords: [
      { root: "D", type: "m7" },
      { root: "G", type: "maj" },
      { root: "C", type: "maj7" },
      { root: "A", type: "m7" },
    ],
  },
  cinematic: {
    bpm: 72,
    scaleType: "harmonic_minor",
    drumStyle: "none",
    bassStyle: "sub",
    leadTimbre: "strings",
    defaultChords: [
      { root: "D", type: "m" },
      { root: "Bb", type: "maj" },
      { root: "F", type: "maj" },
      { root: "C", type: "maj" },
    ],
  },
  edm: {
    bpm: 126,
    scaleType: "minor",
    drumStyle: "four_on_floor",
    bassStyle: "drive",
    leadTimbre: "synth",
    defaultChords: [
      { root: "F", type: "m" },
      { root: "Ab", type: "maj" },
      { root: "Eb", type: "maj" },
      { root: "Bb", type: "m" },
    ],
  },
  rock: {
    bpm: 128,
    scaleType: "minor",
    drumStyle: "rock",
    bassStyle: "drive",
    leadTimbre: "pluck",
    defaultChords: [
      { root: "E", type: "m" },
      { root: "G", type: "maj" },
      { root: "D", type: "maj" },
      { root: "A", type: "m" },
    ],
  },
  acoustic: {
    bpm: 94,
    scaleType: "major",
    drumStyle: "none",
    bassStyle: "warm",
    leadTimbre: "pluck",
    defaultChords: [
      { root: "G", type: "maj" },
      { root: "D", type: "maj" },
      { root: "E", type: "m" },
      { root: "C", type: "maj" },
    ],
  },
  ambient: {
    bpm: 56,
    scaleType: "pentatonic",
    drumStyle: "none",
    bassStyle: "sub",
    leadTimbre: "strings",
    defaultChords: [
      { root: "C", type: "maj7" },
      { root: "F", type: "maj7" },
      { root: "A", type: "m7" },
      { root: "G", type: "sus4" },
    ],
  },
  jazz: {
    bpm: 90,
    scaleType: "dorian",
    drumStyle: "warm_beat",
    bassStyle: "walking",
    leadTimbre: "rhodes",
    defaultChords: [
      { root: "C", type: "maj7" },
      { root: "A", type: "m7" },
      { root: "D", type: "m7" },
      { root: "G", type: "maj" },
    ],
  },
  trap: {
    bpm: 134,
    scaleType: "harmonic_minor",
    drumStyle: "warm_beat",
    bassStyle: "sub",
    leadTimbre: "piano",
    defaultChords: [
      { root: "C", type: "m" },
      { root: "G#", type: "maj" },
      { root: "D#", type: "maj" },
      { root: "A#", type: "m" },
    ],
  },
  pop: {
    bpm: 114,
    scaleType: "major",
    drumStyle: "four_on_floor",
    bassStyle: "drive",
    leadTimbre: "piano",
    defaultChords: [
      { root: "C", type: "maj" },
      { root: "G", type: "maj" },
      { root: "A", type: "m" },
      { root: "F", type: "maj" },
    ],
  },
  chill: {
    bpm: 82,
    scaleType: "minor",
    drumStyle: "none",
    bassStyle: "warm",
    leadTimbre: "piano",
    defaultChords: [
      { root: "E", type: "m7" },
      { root: "B", type: "m7" },
      { root: "C", type: "maj7" },
      { root: "D", type: "maj" },
    ],
  },
};

function detectGenre(prompt: string, seed: number): GenreType {
  const p = prompt.toLowerCase();

  // Explicit check for calm / piano / peace / soft / emotional
  if (
    p.includes("piano") ||
    p.includes("calm") ||
    p.includes("peace") ||
    p.includes("relax") ||
    p.includes("meditat") ||
    p.includes("gentle") ||
    p.includes("sleep") ||
    p.includes("soft") ||
    p.includes("soothing")
  ) {
    return "calm_piano";
  }

  if (
    p.includes("synth") ||
    p.includes("retro") ||
    p.includes("cyberpunk") ||
    p.includes("80s") ||
    p.includes("neon")
  ) {
    return "synthwave";
  }
  if (
    p.includes("lofi") ||
    p.includes("lo-fi") ||
    p.includes("chillhop") ||
    p.includes("study")
  ) {
    return "lofi";
  }
  if (
    p.includes("cinematic") ||
    p.includes("epic") ||
    p.includes("orchestra") ||
    p.includes("film") ||
    p.includes("dramatic") ||
    p.includes("trailer")
  ) {
    return "cinematic";
  }
  if (
    p.includes("techno") ||
    p.includes("house") ||
    p.includes("dance") ||
    p.includes("edm") ||
    p.includes("club")
  ) {
    return "edm";
  }
  if (
    p.includes("rock") ||
    p.includes("metal") ||
    p.includes("electric guitar") ||
    p.includes("punk")
  ) {
    return "rock";
  }
  if (
    p.includes("acoustic") ||
    p.includes("folk") ||
    p.includes("guitar") ||
    p.includes("indie")
  ) {
    return "acoustic";
  }
  if (
    p.includes("ambient") ||
    p.includes("space") ||
    p.includes("drone") ||
    p.includes("atmosphere")
  ) {
    return "ambient";
  }
  if (
    p.includes("jazz") ||
    p.includes("blues") ||
    p.includes("funk") ||
    p.includes("groove") ||
    p.includes("soul")
  ) {
    return "jazz";
  }
  if (
    p.includes("trap") ||
    p.includes("phonk") ||
    p.includes("808") ||
    p.includes("drill")
  ) {
    return "trap";
  }
  if (
    p.includes("pop") ||
    p.includes("happy") ||
    p.includes("cheerful") ||
    p.includes("summer") ||
    p.includes("upbeat")
  ) {
    return "pop";
  }

  const allGenres: GenreType[] = [
    "calm_piano",
    "synthwave",
    "lofi",
    "cinematic",
    "edm",
    "rock",
    "acoustic",
    "ambient",
    "jazz",
    "pop",
    "chill",
  ];
  return allGenres[seed % allGenres.length];
}

// ----------------------------------------------------------------------
// Chord Voicing
// ----------------------------------------------------------------------

interface VoicedChord {
  bass: number;
  notes: number[];
}

function buildChord(
  root: string,
  type: "m" | "maj" | "m7" | "maj7" | "sus4" | "dim",
  octave: number,
  semitoneOffset = 0
): VoicedChord {
  const rootMidi = 12 + octave * 12 + (SEMITONES[root] ?? 0) + semitoneOffset;
  let intervals: number[] = [];

  switch (type) {
    case "m":
      intervals = [0, 3, 7];
      break;
    case "maj":
      intervals = [0, 4, 7];
      break;
    case "m7":
      intervals = [0, 3, 7, 10];
      break;
    case "maj7":
      intervals = [0, 4, 7, 11];
      break;
    case "sus4":
      intervals = [0, 5, 7];
      break;
    case "dim":
      intervals = [0, 3, 6];
      break;
  }

  const notes = intervals.map((int) => midiToFreq(rootMidi + int));
  const bass = midiToFreq(rootMidi - 12);

  return { bass, notes };
}

// ----------------------------------------------------------------------
// WAV Container Construction (44.1 kHz, 16-bit PCM Stereo)
// ----------------------------------------------------------------------

export function createWavHeader(
  dataLength: number,
  sampleRate = 44100,
  numChannels = 2,
  bitsPerSample = 16
): Buffer {
  const buffer = Buffer.alloc(44);
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
  const blockAlign = numChannels * (bitsPerSample / 8);

  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataLength, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20); // PCM
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bitsPerSample, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataLength, 40);

  return buffer;
}

// ----------------------------------------------------------------------
// Primary Procedural Music Generator
// ----------------------------------------------------------------------

export function generateProceduralMusic(options: SynthOptions): Buffer {
  const sampleRate = 44100;
  const numChannels = 2;
  const rawDuration = options.duration || 30;
  const duration = Math.min(Math.max(5, rawDuration), 60);
  const totalSamples = Math.floor(sampleRate * duration);

  const creativity = Math.max(0, Math.min(1, options.creativity ?? 0.5));
  const complexity = Math.max(0, Math.min(1, options.complexity ?? 0.3));

  const promptSeed = hashString(options.prompt.trim() || "orphia music track");
  const combinedSeed =
    (promptSeed ^ (Math.floor(creativity * 1000) << 4)) >>> 0;
  const rng = createPrng(combinedSeed);

  const genre = detectGenre(options.prompt, promptSeed);
  const profile = GENRE_PROFILES[genre];

  const bpmShift = (rng() - 0.5) * 12 * (creativity + 0.1);
  const finalBpm = Math.max(
    52,
    Math.min(150, Math.round(profile.bpm + bpmShift))
  );
  const secondsPerBeat = 60 / finalBpm;
  const chordDurationSec = secondsPerBeat * 4;

  const keyTransposition = Math.floor(rng() * 12) - 5;
  const chords: VoicedChord[] = profile.defaultChords.map((c) =>
    buildChord(c.root, c.type, 3, keyTransposition)
  );

  const leftChannel = new Float32Array(totalSamples);
  const rightChannel = new Float32Array(totalSamples);

  // Pre-generate melodic motif steps
  const melodySteps = [
    Math.floor(rng() * 4),
    Math.floor(rng() * 4),
    Math.floor(rng() * 4),
    Math.floor(rng() * 4),
    Math.floor(rng() * 4),
    Math.floor(rng() * 4),
    Math.floor(rng() * 4),
    Math.floor(rng() * 4),
  ];

  // Low-pass state for gentle filtered percussions
  let snareFilterState = 0;

  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;

    const chordIndex = Math.floor(t / chordDurationSec) % chords.length;
    const chordTime = t % chordDurationSec;
    const beatTime = t % secondsPerBeat;
    const beatIndex = Math.floor(t / secondsPerBeat) % 4;
    const currentChord = chords[chordIndex];

    let sampleL = 0;
    let sampleR = 0;

    // -------------------------------------------------------------
    // 1. Chords & Harmony (Clean Harmonic Tones)
    // -------------------------------------------------------------
    const chordAttack = genre === "calm_piano" ? 0.008 : 0.05;
    const chordDecay =
      genre === "calm_piano"
        ? Math.exp(-chordTime * 0.7)
        : Math.sin(
            Math.min(1, chordTime / (chordDurationSec * 0.3)) * (Math.PI / 2)
          ) * Math.max(0, 1 - chordTime / (chordDurationSec * 1.05));

    for (let c = 0; c < currentChord.notes.length; c++) {
      const f = currentChord.notes[c];
      const pan = (c % 2 === 0 ? 0.5 : -0.5) * 0.2;

      let osc = 0;
      if (profile.leadTimbre === "piano") {
        osc = pianoTone(f, t, chordTime);
      } else if (profile.leadTimbre === "rhodes") {
        osc = rhodesTone(f, t, chordTime);
      } else if (profile.leadTimbre === "strings") {
        osc = stringsTone(f, t) * chordDecay * 0.35;
      } else if (profile.leadTimbre === "synth") {
        osc = warmSynthTone(f, t) * chordDecay * 0.35;
      } else {
        osc = pluckTone(f, t, chordTime);
      }

      sampleL += osc * (0.5 + pan);
      sampleR += osc * (0.5 - pan);
    }

    // -------------------------------------------------------------
    // 2. Bassline Engine (Clean Sine / Piano Bass)
    // -------------------------------------------------------------
    const bassFreq = currentChord.bass;
    let bassOsc = 0;

    if (profile.bassStyle === "piano") {
      // Warm acoustic piano left-hand bass
      bassOsc = pianoTone(bassFreq, t, chordTime % (secondsPerBeat * 2)) * 0.65;
    } else if (profile.bassStyle === "drive") {
      // Pumping sidechain bass
      const bTime = beatTime;
      const bEnv = Math.min(1, bTime * 6) * Math.exp(-bTime * 2.8) * 0.38;
      bassOsc =
        (Math.sin(2 * Math.PI * bassFreq * t) * 0.7 +
          Math.sin(4 * Math.PI * bassFreq * t) * 0.3) *
        bEnv;
    } else if (profile.bassStyle === "sub") {
      // Deep 808 sine sub-bass
      const bEnv = Math.exp(-chordTime * 0.55) * 0.45;
      bassOsc = Math.sin(2 * Math.PI * bassFreq * t) * bEnv;
    } else {
      // Warm jazz/lofi walking bass
      const bTime = beatTime;
      const bEnv = Math.exp(-bTime * 3.0) * 0.4;
      bassOsc =
        (Math.sin(2 * Math.PI * bassFreq * t) * 0.8 +
          Math.sin(4 * Math.PI * bassFreq * t) * 0.2) *
        bEnv;
    }

    sampleL += bassOsc;
    sampleR += bassOsc;

    // -------------------------------------------------------------
    // 3. Dynamic Lead Melody & Arpeggio
    // -------------------------------------------------------------
    const arpSub =
      complexity > 0.6
        ? secondsPerBeat / 4
        : complexity > 0.25
        ? secondsPerBeat / 2
        : secondsPerBeat;

    const arpIndex = Math.floor(t / arpSub) % melodySteps.length;
    const arpTime = t % arpSub;
    const noteIdx = melodySteps[arpIndex] % currentChord.notes.length;
    const melodyFreq = currentChord.notes[noteIdx] * 2; // an octave higher

    let melOsc = 0;
    if (profile.leadTimbre === "piano") {
      melOsc = pianoTone(melodyFreq, t, arpTime) * 0.7;
    } else if (profile.leadTimbre === "rhodes") {
      melOsc = rhodesTone(melodyFreq, t, arpTime) * 0.6;
    } else if (profile.leadTimbre === "synth") {
      const env = Math.exp(-arpTime * 6) * 0.32;
      melOsc =
        (Math.sin(2 * Math.PI * melodyFreq * t) * 0.7 +
          Math.sin(4 * Math.PI * melodyFreq * t) * 0.3) *
        env;
    } else {
      melOsc = pluckTone(melodyFreq, t, arpTime) * 0.6;
    }

    const arpPan = Math.sin(t * 1.5) * 0.25;
    sampleL += melOsc * (0.5 + arpPan);
    sampleR += melOsc * (0.5 - arpPan);

    // -------------------------------------------------------------
    // 4. Studio Percussion (Pure Sines & Warm Low-Pass Filters)
    // -------------------------------------------------------------
    if (profile.drumStyle !== "none") {
      // A. Kick Drum (Exponential pitch sweep sine, zero noise)
      let kickHit = false;
      if (profile.drumStyle === "four_on_floor") {
        kickHit = true;
      } else if (profile.drumStyle === "synth" || profile.drumStyle === "rock") {
        kickHit = beatIndex === 0 || beatIndex === 2;
      } else if (profile.drumStyle === "warm_beat") {
        kickHit = beatIndex === 0 || (beatIndex === 2 && chordIndex % 2 === 1);
      }

      if (kickHit) {
        const kTime = beatTime;
        if (kTime < 0.22) {
          const kFreq = 42 + 95 * Math.exp(-kTime * 38);
          const kEnv = Math.exp(-kTime * 15) * 0.55;
          const kOsc = Math.sin(2 * Math.PI * kFreq * kTime) * kEnv;
          sampleL += kOsc;
          sampleR += kOsc;
        }
      }

      // B. Snare / Rim (Resonant dual-tone + heavily filtered warm rattle)
      let snareHit = false;
      if (
        profile.drumStyle === "four_on_floor" ||
        profile.drumStyle === "synth" ||
        profile.drumStyle === "rock" ||
        profile.drumStyle === "warm_beat"
      ) {
        snareHit = beatIndex === 1 || beatIndex === 3;
      }

      if (snareHit) {
        const sTime = beatTime;
        if (sTime < 0.18) {
          const sEnv = Math.exp(-sTime * 22) * 0.35;
          // 2 tuned body resonators (180Hz + 330Hz)
          const body =
            Math.sin(2 * Math.PI * 180 * sTime) * 0.6 +
            Math.sin(2 * Math.PI * 330 * sTime) * 0.4;
          sampleL += body * sEnv;
          sampleR += body * sEnv;
        }
      }
    }

    // -------------------------------------------------------------
    // 5. Master Fade In / Fade Out
    // -------------------------------------------------------------
    let masterFade = 1.0;
    if (t < 0.8) {
      masterFade = t / 0.8;
    } else if (t > duration - 1.5) {
      masterFade = (duration - t) / 1.5;
    }

    leftChannel[i] = sampleL * masterFade;
    rightChannel[i] = sampleR * masterFade;
  }

  // Soft limiting (tanh) & 16-bit PCM encoding
  const pcmBuffer = Buffer.alloc(totalSamples * numChannels * 2);
  for (let i = 0; i < totalSamples; i++) {
    const l = Math.tanh(leftChannel[i]);
    const r = Math.tanh(rightChannel[i]);

    const intL = Math.max(-32768, Math.min(32767, Math.floor(l * 30000)));
    const intR = Math.max(-32768, Math.min(32767, Math.floor(r * 30000)));

    pcmBuffer.writeInt16LE(intL, i * 4);
    pcmBuffer.writeInt16LE(intR, i * 4 + 2);
  }

  const header = createWavHeader(pcmBuffer.length, sampleRate, numChannels, 16);
  return Buffer.concat([header, pcmBuffer]);
}

// ----------------------------------------------------------------------
// Audio Sample Transformation & Accompaniment Engine
// ----------------------------------------------------------------------

export function transformSampleMusic(options: SampleTransformOptions): Buffer {
  const sampleRate = 44100;
  const numChannels = 2;
  const rawDuration = options.duration || 30;
  const targetDuration = Math.min(Math.max(5, rawDuration), 60);
  const totalSamples = Math.floor(sampleRate * targetDuration);

  const sampleInfluence =
    Math.max(0, Math.min(100, options.sampleInfluence ?? 70)) / 100;
  const transformationStyle =
    Math.max(0, Math.min(100, options.transformationStyle ?? 50)) / 100;

  // 1. Generate complementary musical accompaniment based on user's prompt
  const accompaniment = generateProceduralMusic({
    prompt: options.prompt || "harmonic musical backing extension",
    duration: targetDuration,
    creativity: transformationStyle,
    complexity: 0.3 + transformationStyle * 0.4,
  });

  const accompPcm = accompaniment.subarray(44);

  // 2. Decode uploaded sample PCM if WAV format
  let uploadedSamplesL: Float32Array | null = null;
  let uploadedSamplesR: Float32Array | null = null;

  try {
    const buf = options.sampleBuffer;
    if (
      buf.length > 44 &&
      buf.slice(0, 4).toString("ascii") === "RIFF" &&
      buf.slice(8, 12).toString("ascii") === "WAVE"
    ) {
      let dataOffset = 44;
      let dataSize = buf.length - 44;
      let channels = 2;
      let bitsPerSample = 16;
      let inSampleRate = 44100;

      let pos = 12;
      while (pos < buf.length - 8) {
        const chunkId = buf.slice(pos, pos + 4).toString("ascii");
        const chunkSize = buf.readUInt32LE(pos + 4);
        if (chunkId === "fmt ") {
          channels = buf.readUInt16LE(pos + 10);
          inSampleRate = buf.readUInt32LE(pos + 12);
          bitsPerSample = buf.readUInt16LE(pos + 22);
        } else if (chunkId === "data") {
          dataOffset = pos + 8;
          dataSize = chunkSize;
          break;
        }
        pos += 8 + chunkSize;
      }

      const bytesPerSample = bitsPerSample / 8;
      const numInputSamples = Math.floor(dataSize / (channels * bytesPerSample));
      uploadedSamplesL = new Float32Array(numInputSamples);
      uploadedSamplesR = new Float32Array(numInputSamples);

      for (let s = 0; s < numInputSamples; s++) {
        const byteIndex = dataOffset + s * channels * bytesPerSample;
        if (byteIndex + 2 <= buf.length) {
          const valL = buf.readInt16LE(byteIndex) / 32768;
          const valR =
            channels > 1 && byteIndex + 4 <= buf.length
              ? buf.readInt16LE(byteIndex + 2) / 32768
              : valL;
          uploadedSamplesL[s] = valL;
          uploadedSamplesR[s] = valR;
        }
      }
    }
  } catch (parseErr) {
    console.warn("Uploaded sample is not uncompressed WAV:", parseErr);
  }

  // 3. Composite & Mix original sample with generated accompaniment
  // NOTICE: If uploaded sample is null/empty, we DO NOT inject random bytes!
  // Instead, the accompaniment plays purely and cleanly with zero static!
  const mixedPcm = Buffer.alloc(totalSamples * numChannels * 2);
  const sampleMixVol = sampleInfluence * 1.0;
  const accompMixVol = 0.4 + transformationStyle * 0.6;

  for (let i = 0; i < totalSamples; i++) {
    let accL = 0;
    let accR = 0;
    const accByteIdx = i * 4;
    if (accByteIdx + 3 < accompPcm.length) {
      accL = accompPcm.readInt16LE(accByteIdx) / 32768;
      accR = accompPcm.readInt16LE(accByteIdx + 2) / 32768;
    }

    let uplL = 0;
    let uplR = 0;
    if (uploadedSamplesL && uploadedSamplesL.length > 0) {
      const sampleIdx = i % uploadedSamplesL.length;
      uplL = uploadedSamplesL[sampleIdx];
      uplR = uploadedSamplesR![sampleIdx];
    }

    // Mix cleanly without noise injection
    const finalL = Math.tanh(uplL * sampleMixVol + accL * accompMixVol);
    const finalR = Math.tanh(uplR * sampleMixVol + accR * accompMixVol);

    const intL = Math.max(-32768, Math.min(32767, Math.floor(finalL * 30000)));
    const intR = Math.max(-32768, Math.min(32767, Math.floor(finalR * 30000)));

    mixedPcm.writeInt16LE(intL, i * 4);
    mixedPcm.writeInt16LE(intR, i * 4 + 2);
  }

  const header = createWavHeader(mixedPcm.length, sampleRate, numChannels, 16);
  return Buffer.concat([header, mixedPcm]);
}
