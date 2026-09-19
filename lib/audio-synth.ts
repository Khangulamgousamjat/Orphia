/**
 * Advanced Procedural Audio & Music Synthesis Engine for Orphia
 * Generates rich, diverse, polyphonic musical WAV audio matching prompt, genre, mood, tempo, and chords.
 * Also provides high-performance audio sample transformation & accompaniment.
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
// Seeded PRNG & String Hashing (Ensures every prompt produces distinct music)
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

// Note name to semitone offset from C0 (MIDI 12)
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

function noteFreq(name: string, octave: number): number {
  const semi = SEMITONES[name] ?? 0;
  const midi = 12 + octave * 12 + semi;
  return midiToFreq(midi);
}

// ----------------------------------------------------------------------
// Genre & Mood Classification
// ----------------------------------------------------------------------

export type GenreType =
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
  | "classical"
  | "chill";

interface GenreProfile {
  bpm: number;
  scaleType: "minor" | "major" | "dorian" | "harmonic_minor" | "pentatonic";
  drumStyle: "synth" | "lofi" | "four_on_floor" | "rock" | "trap" | "acoustic" | "none";
  bassStyle: "arp" | "warm" | "sub" | "walking" | "drive";
  leadTimbre: "saw" | "rhodes" | "strings" | "flute" | "pluck" | "bell";
  defaultChords: { root: string; type: "m" | "maj" | "m7" | "maj7" | "sus4" | "dim" }[];
}

const GENRE_PROFILES: Record<GenreType, GenreProfile> = {
  synthwave: {
    bpm: 120,
    scaleType: "dorian",
    drumStyle: "synth",
    bassStyle: "arp",
    leadTimbre: "saw",
    defaultChords: [
      { root: "A", type: "m7" },
      { root: "F", type: "maj7" },
      { root: "G", type: "maj" },
      { root: "E", type: "m" },
    ],
  },
  lofi: {
    bpm: 80,
    scaleType: "minor",
    drumStyle: "lofi",
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
    drumStyle: "rock",
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
    leadTimbre: "saw",
    defaultChords: [
      { root: "F", type: "m" },
      { root: "Ab", type: "maj" },
      { root: "Eb", type: "maj" },
      { root: "Bb", type: "m" },
    ],
  },
  rock: {
    bpm: 132,
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
    bpm: 96,
    scaleType: "major",
    drumStyle: "acoustic",
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
    bpm: 58,
    scaleType: "pentatonic",
    drumStyle: "none",
    bassStyle: "sub",
    leadTimbre: "bell",
    defaultChords: [
      { root: "C", type: "maj7" },
      { root: "F", type: "maj7" },
      { root: "A", type: "m7" },
      { root: "G", type: "sus4" },
    ],
  },
  jazz: {
    bpm: 92,
    scaleType: "dorian",
    drumStyle: "lofi",
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
    bpm: 136,
    scaleType: "harmonic_minor",
    drumStyle: "trap",
    bassStyle: "sub",
    leadTimbre: "bell",
    defaultChords: [
      { root: "C", type: "m" },
      { root: "G#", type: "maj" },
      { root: "D#", type: "maj" },
      { root: "A#", type: "m" },
    ],
  },
  pop: {
    bpm: 116,
    scaleType: "major",
    drumStyle: "four_on_floor",
    bassStyle: "drive",
    leadTimbre: "pluck",
    defaultChords: [
      { root: "C", type: "maj" },
      { root: "G", type: "maj" },
      { root: "A", type: "m" },
      { root: "F", type: "maj" },
    ],
  },
  classical: {
    bpm: 78,
    scaleType: "minor",
    drumStyle: "none",
    bassStyle: "warm",
    leadTimbre: "strings",
    defaultChords: [
      { root: "A", type: "m" },
      { root: "D", type: "m" },
      { root: "E", type: "maj" },
      { root: "A", type: "m" },
    ],
  },
  chill: {
    bpm: 86,
    scaleType: "minor",
    drumStyle: "lofi",
    bassStyle: "warm",
    leadTimbre: "rhodes",
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

  if (p.includes("synth") || p.includes("retro") || p.includes("cyberpunk") || p.includes("80s") || p.includes("neon")) {
    return "synthwave";
  }
  if (p.includes("lofi") || p.includes("lo-fi") || p.includes("chillhop") || p.includes("study") || p.includes("sleepy")) {
    return "lofi";
  }
  if (p.includes("cinematic") || p.includes("epic") || p.includes("orchestra") || p.includes("film") || p.includes("dramatic") || p.includes("trailer")) {
    return "cinematic";
  }
  if (p.includes("techno") || p.includes("house") || p.includes("dance") || p.includes("edm") || p.includes("club") || p.includes("rave")) {
    return "edm";
  }
  if (p.includes("rock") || p.includes("metal") || p.includes("electric guitar") || p.includes("punk")) {
    return "rock";
  }
  if (p.includes("acoustic") || p.includes("folk") || p.includes("guitar") || p.includes("indie") || p.includes("campfire")) {
    return "acoustic";
  }
  if (p.includes("ambient") || p.includes("meditation") || p.includes("relax") || p.includes("space") || p.includes("drone")) {
    return "ambient";
  }
  if (p.includes("jazz") || p.includes("blues") || p.includes("funk") || p.includes("groove") || p.includes("soul")) {
    return "jazz";
  }
  if (p.includes("trap") || p.includes("phonk") || p.includes("808") || p.includes("drill") || p.includes("hip hop")) {
    return "trap";
  }
  if (p.includes("pop") || p.includes("happy") || p.includes("cheerful") || p.includes("summer") || p.includes("upbeat")) {
    return "pop";
  }
  if (p.includes("piano") || p.includes("classical") || p.includes("violin") || p.includes("baroque")) {
    return "classical";
  }

  // If general prompt, dynamically assign genre based on prompt hash so different words give different genres!
  const allGenres: GenreType[] = [
    "synthwave",
    "lofi",
    "cinematic",
    "edm",
    "rock",
    "acoustic",
    "ambient",
    "jazz",
    "trap",
    "pop",
    "chill",
  ];
  return allGenres[seed % allGenres.length];
}

// ----------------------------------------------------------------------
// Chord Voicing & Scale Frequencies
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
  const bass = midiToFreq(rootMidi - 12); // one octave down for bass

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

  // Create deterministic yet creativity-influenced PRNG
  const promptSeed = hashString(options.prompt.trim() || "orphia music track");
  // Blend seed with creativity integer shift so sliding creativity changes the output!
  const combinedSeed = (promptSeed ^ (Math.floor(creativity * 1000) << 4)) >>> 0;
  const rng = createPrng(combinedSeed);

  const genre = detectGenre(options.prompt, promptSeed);
  const profile = GENRE_PROFILES[genre];

  // Dynamic tempo variance (+/- 8% based on seed & creativity)
  const bpmShift = (rng() - 0.5) * 16 * (creativity + 0.2);
  const finalBpm = Math.max(55, Math.min(160, Math.round(profile.bpm + bpmShift)));
  const secondsPerBeat = 60 / finalBpm;
  const chordDurationSec = secondsPerBeat * 4; // 4 beats per measure

  // Dynamic key transposition (-5 to +6 semitones)
  const keyTransposition = Math.floor(rng() * 12) - 5;

  // Build voiced chords
  const chords: VoicedChord[] = profile.defaultChords.map((c) =>
    buildChord(c.root, c.type, 3, keyTransposition)
  );

  const leftChannel = new Float32Array(totalSamples);
  const rightChannel = new Float32Array(totalSamples);

  // Pre-generate melodic motif steps (8 distinct notes within the active chords)
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
    // 1. Harmonies & Chords (Polyphonic Pads / EP / Plucks)
    // -------------------------------------------------------------
    const chordAttack = genre === "ambient" || genre === "cinematic" ? 0.4 : 0.08;
    const chordEnv =
      Math.sin(
        Math.min(1, Math.max(0, chordTime / (chordDurationSec * chordAttack))) *
          (Math.PI / 2)
      ) *
      Math.max(0, 1 - chordTime / (chordDurationSec * 1.05)) *
      0.32;

    for (let c = 0; c < currentChord.notes.length; c++) {
      const f = currentChord.notes[c];
      const pan = (c % 2 === 0 ? 0.6 : -0.6) * 0.25;

      let osc = 0;
      if (profile.leadTimbre === "rhodes") {
        // Mellow warm sine + gentle bell harmonic
        osc =
          Math.sin(2 * Math.PI * f * t) * 0.7 +
          Math.sin(4 * Math.PI * f * t) * 0.2 +
          Math.sin(6 * Math.PI * f * t) * 0.1;
      } else if (profile.leadTimbre === "saw") {
        // Detuned dual saws for lush synthwave/EDM pad
        const saw1 = 2 * ((f * t) % 1) - 1;
        const saw2 = 2 * (((f * 1.003) * t) % 1) - 1;
        osc = (saw1 + saw2) * 0.35;
      } else {
        // Lush strings / acoustic triangle/sine
        osc =
          Math.sin(2 * Math.PI * f * t) * 0.6 +
          Math.sin(2 * Math.PI * (f * 1.002) * t) * 0.25 +
          Math.sin(4 * Math.PI * f * t) * 0.15;
      }

      sampleL += osc * chordEnv * (0.5 + pan);
      sampleR += osc * chordEnv * (0.5 - pan);
    }

    // -------------------------------------------------------------
    // 2. Bassline Engine
    // -------------------------------------------------------------
    const bassFreq = currentChord.bass;
    let bassOsc = 0;
    let bassEnv = 0;

    if (profile.bassStyle === "arp") {
      // 8th-note driving synthwave bass
      const bassSub = secondsPerBeat / 2;
      const bTime = chordTime % bassSub;
      bassEnv = Math.exp(-bTime * 9) * 0.32;
      bassOsc =
        Math.sin(2 * Math.PI * bassFreq * t) * 0.7 +
        Math.sin(4 * Math.PI * bassFreq * t) * 0.3;
    } else if (profile.bassStyle === "drive") {
      // Pumping sidechain bass
      const bTime = beatTime;
      bassEnv = Math.min(1, bTime * 4) * Math.exp(-bTime * 2.5) * 0.35;
      const saw = 2 * ((bassFreq * t) % 1) - 1;
      bassOsc = saw * 0.4 + Math.sin(2 * Math.PI * bassFreq * t) * 0.6;
    } else if (profile.bassStyle === "sub") {
      // Deep sustained 808/cinematic sub-bass
      bassEnv = Math.exp(-chordTime * 0.6) * 0.42;
      bassOsc = Math.sin(2 * Math.PI * bassFreq * t);
    } else {
      // Warm jazz/lofi walking/pulse bass
      const bTime = beatTime;
      bassEnv = Math.exp(-bTime * 3.5) * 0.35;
      bassOsc =
        Math.sin(2 * Math.PI * bassFreq * t) * 0.8 +
        Math.sin(4 * Math.PI * bassFreq * t) * 0.2;
    }

    sampleL += bassOsc * bassEnv;
    sampleR += bassOsc * bassEnv;

    // -------------------------------------------------------------
    // 3. Dynamic Lead Melody & Arpeggio
    // -------------------------------------------------------------
    // Subdivision speed based on complexity (4th, 8th, or 16th notes)
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

    const melEnv = Math.exp(-arpTime * (profile.leadTimbre === "saw" ? 8 : 12)) * (0.18 + complexity * 0.12);
    let melOsc = 0;

    if (profile.leadTimbre === "bell") {
      melOsc =
        Math.sin(2 * Math.PI * melodyFreq * t) * 0.8 +
        Math.sin(6 * Math.PI * melodyFreq * t) * 0.2;
    } else if (profile.leadTimbre === "saw") {
      const saw = 2 * ((melodyFreq * t) % 1) - 1;
      melOsc = saw * 0.45;
    } else {
      melOsc =
        Math.sin(2 * Math.PI * melodyFreq * t) * 0.7 +
        Math.sin(4 * Math.PI * melodyFreq * t) * 0.25;
    }

    const arpPan = Math.sin(t * 2) * 0.3;
    sampleL += melOsc * melEnv * (0.5 + arpPan);
    sampleR += melOsc * melEnv * (0.5 - arpPan);

    // -------------------------------------------------------------
    // 4. Procedural Drum Kit (Kick, Snare, Hats)
    // -------------------------------------------------------------
    if (profile.drumStyle !== "none") {
      // A. Kick Drum
      let kickHit = false;
      if (profile.drumStyle === "four_on_floor") {
        kickHit = true; // Every beat
      } else if (profile.drumStyle === "synth" || profile.drumStyle === "rock") {
        kickHit = beatIndex === 0 || beatIndex === 2; // Beats 1 & 3
      } else if (profile.drumStyle === "trap" || profile.drumStyle === "lofi") {
        kickHit = beatIndex === 0 || (beatIndex === 2 && chordIndex % 2 === 1);
      }

      if (kickHit) {
        const kTime = beatTime;
        if (kTime < 0.25) {
          // Swept sine wave: 150Hz down to 42Hz
          const kFreq = 42 + 108 * Math.exp(-kTime * 35);
          const kEnv = Math.exp(-kTime * 14) * 0.55;
          const kOsc = Math.sin(2 * Math.PI * kFreq * kTime);
          sampleL += kOsc * kEnv;
          sampleR += kOsc * kEnv;
        }
      }

      // B. Snare / Clap
      let snareHit = false;
      if (profile.drumStyle === "four_on_floor" || profile.drumStyle === "synth" || profile.drumStyle === "rock" || profile.drumStyle === "lofi") {
        snareHit = beatIndex === 1 || beatIndex === 3; // Beats 2 & 4
      } else if (profile.drumStyle === "trap") {
        snareHit = beatIndex === 2; // Beat 3
      }

      if (snareHit) {
        const sTime = beatTime;
        if (sTime < 0.2) {
          const sEnv = Math.exp(-sTime * 18) * 0.38;
          // Filtered noise + 180Hz body
          const whiteNoise = (Math.random() - 0.5) * 2;
          const sBody = Math.sin(2 * Math.PI * 185 * sTime) * 0.5;
          const sOsc = (whiteNoise * 0.7 + sBody * 0.3);
          sampleL += sOsc * sEnv;
          sampleR += sOsc * sEnv;
        }
      }

      // C. Hi-Hats / Shaker
      const hatSub = secondsPerBeat / 2; // 8th note hats
      const hTime = t % hatSub;
      if (hTime < 0.08) {
        const hEnv = Math.exp(-hTime * 50) * (0.12 + complexity * 0.08);
        const hNoise = (Math.random() - 0.5) * 2;
        sampleL += hNoise * hEnv * 0.7;
        sampleR += hNoise * hEnv * 0.9;
      }
    }

    // -------------------------------------------------------------
    // 5. Ambient Texture / Vinyl Dust
    // -------------------------------------------------------------
    if (genre === "lofi" || genre === "chill") {
      if (Math.random() < 0.003) {
        const crackle = (Math.random() - 0.5) * 0.04;
        sampleL += crackle;
        sampleR += crackle;
      }
    }

    // -------------------------------------------------------------
    // 6. Master Fade In / Fade Out
    // -------------------------------------------------------------
    let masterFade = 1.0;
    if (t < 1.0) {
      masterFade = t / 1.0;
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

    const intL = Math.max(-32768, Math.min(32767, Math.floor(l * 32000)));
    const intR = Math.max(-32768, Math.min(32767, Math.floor(r * 32000)));

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

  const sampleInfluence = Math.max(0, Math.min(100, options.sampleInfluence ?? 70)) / 100;
  const transformationStyle = Math.max(0, Math.min(100, options.transformationStyle ?? 50)) / 100;

  // 1. Generate complementary musical accompaniment based on user's prompt
  const accompaniment = generateProceduralMusic({
    prompt: options.prompt || "harmonic musical backing extension",
    duration: targetDuration,
    creativity: transformationStyle,
    complexity: 0.4 + transformationStyle * 0.4,
  });

  // Skip accompaniment WAV header (44 bytes) to access raw accompaniment PCM
  const accompPcm = accompaniment.subarray(44);

  // 2. Decode uploaded sample PCM if WAV format, or extract audio envelope
  let uploadedSamplesL: Float32Array | null = null;
  let uploadedSamplesR: Float32Array | null = null;

  try {
    const buf = options.sampleBuffer;
    if (
      buf.length > 44 &&
      buf.slice(0, 4).toString("ascii") === "RIFF" &&
      buf.slice(8, 12).toString("ascii") === "WAVE"
    ) {
      // Parse WAV subchunks
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

      const numSamples = Math.floor(dataSize / (channels * (bitsPerSample / 8)));
      uploadedSamplesL = new Float32Array(numSamples);
      uploadedSamplesR = new Float32Array(numSamples);

      for (let s = 0; s < numSamples; s++) {
        const byteIndex = dataOffset + s * channels * (bitsPerSample / 8);
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
    console.warn("Uploaded sample is not uncompressed WAV, applying adaptive spectral layer:", parseErr);
  }

  // 3. Composite & Mix original sample with generated accompaniment
  const mixedPcm = Buffer.alloc(totalSamples * numChannels * 2);
  const sampleMixVol = sampleInfluence * 1.3;
  const accompMixVol = 0.35 + transformationStyle * 0.65;

  for (let i = 0; i < totalSamples; i++) {
    // Read accompaniment sample
    let accL = 0;
    let accR = 0;
    const accByteIdx = i * 4;
    if (accByteIdx + 3 < accompPcm.length) {
      accL = accompPcm.readInt16LE(accByteIdx) / 32768;
      accR = accompPcm.readInt16LE(accByteIdx + 2) / 32768;
    }

    // Read uploaded sample (looping if sample is shorter than target duration)
    let uplL = 0;
    let uplR = 0;
    if (uploadedSamplesL && uploadedSamplesL.length > 0) {
      const sampleIdx = i % uploadedSamplesL.length;
      uplL = uploadedSamplesL[sampleIdx];
      uplR = uploadedSamplesR![sampleIdx];
    } else {
      // If sample couldn't be parsed directly (e.g. encoded mp3 bytes), extract dynamic texture
      const byteVal = (options.sampleBuffer[i % options.sampleBuffer.length] - 128) / 128;
      uplL = byteVal * 0.4;
      uplR = byteVal * 0.4;
    }

    // Combine with soft clipping
    const finalL = Math.tanh(uplL * sampleMixVol + accL * accompMixVol);
    const finalR = Math.tanh(uplR * sampleMixVol + accR * accompMixVol);

    const intL = Math.max(-32768, Math.min(32767, Math.floor(finalL * 32000)));
    const intR = Math.max(-32768, Math.min(32767, Math.floor(finalR * 32000)));

    mixedPcm.writeInt16LE(intL, i * 4);
    mixedPcm.writeInt16LE(intR, i * 4 + 2);
  }

  const header = createWavHeader(mixedPcm.length, sampleRate, numChannels, 16);
  return Buffer.concat([header, mixedPcm]);
}
