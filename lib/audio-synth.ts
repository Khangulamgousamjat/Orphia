/**
 * Procedural Audio & Music Synthesis Engine for Orphia
 * Generates polyphonic harmonic music WAV streams matching prompt mood, tempo, and chords.
 */

export interface SynthOptions {
  prompt: string;
  duration?: number;
  creativity?: number;
  complexity?: number;
}

// Frequencies for musical notes (Hz)
const NOTE_FREQS: Record<string, number> = {
  C2: 65.41,
  D2: 73.42,
  E2: 82.41,
  F2: 87.31,
  G2: 98.0,
  A2: 110.0,
  B2: 123.47,

  C3: 130.81,
  D3: 146.83,
  Eb3: 155.56,
  E3: 164.81,
  F3: 174.61,
  G3: 196.0,
  Ab3: 207.65,
  A3: 220.0,
  Bb3: 233.08,
  B3: 246.94,

  C4: 261.63,
  D4: 293.66,
  Eb4: 311.13,
  E4: 329.63,
  F4: 349.23,
  G4: 392.0,
  Ab4: 415.3,
  A4: 440.0,
  Bb4: 466.16,
  B4: 493.88,

  C5: 523.25,
  D5: 587.33,
  Eb5: 622.25,
  E5: 659.25,
  F5: 698.46,
  G5: 783.99,
  A5: 880.0,
  B5: 987.77,
  C6: 1046.5,
};

type Mood = "cinematic" | "lofi" | "ambient" | "upbeat" | "chill";

function detectMood(prompt: string): Mood {
  const p = prompt.toLowerCase();
  if (
    p.includes("cinematic") ||
    p.includes("emotional") ||
    p.includes("sad") ||
    p.includes("film") ||
    p.includes("orchestra") ||
    p.includes("piano")
  ) {
    return "cinematic";
  }
  if (
    p.includes("lofi") ||
    p.includes("lo-fi") ||
    p.includes("study") ||
    p.includes("hip hop") ||
    p.includes("beat")
  ) {
    return "lofi";
  }
  if (
    p.includes("ambient") ||
    p.includes("meditation") ||
    p.includes("relax") ||
    p.includes("sleep") ||
    p.includes("nature")
  ) {
    return "ambient";
  }
  if (
    p.includes("upbeat") ||
    p.includes("pop") ||
    p.includes("dance") ||
    p.includes("happy") ||
    p.includes("energetic")
  ) {
    return "upbeat";
  }
  return "chill";
}

// Chord progression definitions
const CHORD_PROGRESSIONS: Record<
  Mood,
  {
    bpm: number;
    chords: { bass: number; notes: number[] }[];
  }
> = {
  cinematic: {
    bpm: 72,
    chords: [
      // Am
      {
        bass: NOTE_FREQS.A2,
        notes: [NOTE_FREQS.A3, NOTE_FREQS.C4, NOTE_FREQS.E4, NOTE_FREQS.A4],
      },
      // F
      {
        bass: NOTE_FREQS.F2,
        notes: [NOTE_FREQS.F3, NOTE_FREQS.A3, NOTE_FREQS.C4, NOTE_FREQS.F4],
      },
      // C
      {
        bass: NOTE_FREQS.C2,
        notes: [NOTE_FREQS.C3, NOTE_FREQS.G3, NOTE_FREQS.C4, NOTE_FREQS.E4],
      },
      // G
      {
        bass: NOTE_FREQS.G2,
        notes: [NOTE_FREQS.G3, NOTE_FREQS.B3, NOTE_FREQS.D4, NOTE_FREQS.G4],
      },
    ],
  },
  lofi: {
    bpm: 80,
    chords: [
      // Dm9
      {
        bass: NOTE_FREQS.D2,
        notes: [NOTE_FREQS.F3, NOTE_FREQS.A3, NOTE_FREQS.C4, NOTE_FREQS.E4],
      },
      // G13
      {
        bass: NOTE_FREQS.G2,
        notes: [NOTE_FREQS.F3, NOTE_FREQS.B3, NOTE_FREQS.E4, NOTE_FREQS.A4],
      },
      // Cmaj7
      {
        bass: NOTE_FREQS.C2,
        notes: [NOTE_FREQS.E3, NOTE_FREQS.G3, NOTE_FREQS.B3, NOTE_FREQS.D4],
      },
      // Am7
      {
        bass: NOTE_FREQS.A2,
        notes: [NOTE_FREQS.C3, NOTE_FREQS.E3, NOTE_FREQS.G3, NOTE_FREQS.C4],
      },
    ],
  },
  ambient: {
    bpm: 60,
    chords: [
      // Csus2
      {
        bass: NOTE_FREQS.C2,
        notes: [NOTE_FREQS.G3, NOTE_FREQS.D4, NOTE_FREQS.G4, NOTE_FREQS.C5],
      },
      // Fsus2
      {
        bass: NOTE_FREQS.F2,
        notes: [NOTE_FREQS.C4, NOTE_FREQS.G4, NOTE_FREQS.C5, NOTE_FREQS.F5],
      },
      // Am7
      {
        bass: NOTE_FREQS.A2,
        notes: [NOTE_FREQS.E3, NOTE_FREQS.C4, NOTE_FREQS.G4, NOTE_FREQS.A4],
      },
      // Gsus4
      {
        bass: NOTE_FREQS.G2,
        notes: [NOTE_FREQS.D4, NOTE_FREQS.G4, NOTE_FREQS.C5, NOTE_FREQS.D5],
      },
    ],
  },
  upbeat: {
    bpm: 116,
    chords: [
      // C
      {
        bass: NOTE_FREQS.C3,
        notes: [NOTE_FREQS.C4, NOTE_FREQS.E4, NOTE_FREQS.G4, NOTE_FREQS.C5],
      },
      // G
      {
        bass: NOTE_FREQS.G2,
        notes: [NOTE_FREQS.B3, NOTE_FREQS.D4, NOTE_FREQS.G4, NOTE_FREQS.D5],
      },
      // Am
      {
        bass: NOTE_FREQS.A2,
        notes: [NOTE_FREQS.C4, NOTE_FREQS.E4, NOTE_FREQS.A4, NOTE_FREQS.C5],
      },
      // F
      {
        bass: NOTE_FREQS.F2,
        notes: [NOTE_FREQS.A3, NOTE_FREQS.C4, NOTE_FREQS.F4, NOTE_FREQS.A4],
      },
    ],
  },
  chill: {
    bpm: 85,
    chords: [
      // Em7
      {
        bass: NOTE_FREQS.E2,
        notes: [NOTE_FREQS.G3, NOTE_FREQS.B3, NOTE_FREQS.D4, NOTE_FREQS.G4],
      },
      // Bm7
      {
        bass: NOTE_FREQS.B2,
        notes: [NOTE_FREQS.D3, NOTE_FREQS.F3, NOTE_FREQS.A3, NOTE_FREQS.D4],
      },
      // Cmaj7
      {
        bass: NOTE_FREQS.C2,
        notes: [NOTE_FREQS.G3, NOTE_FREQS.B3, NOTE_FREQS.E4, NOTE_FREQS.G4],
      },
      // D
      {
        bass: NOTE_FREQS.D2,
        notes: [NOTE_FREQS.A3, NOTE_FREQS.D4, NOTE_FREQS.F4, NOTE_FREQS.A4],
      },
    ],
  },
};

/**
 * Generates a WAV header buffer
 */
function createWavHeader(
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

/**
 * Synthesizes musical audio based on text prompt and duration
 */
export function generateProceduralMusic(options: SynthOptions): Buffer {
  const sampleRate = 44100;
  // Keep duration between 8 and 30 seconds for fast and smooth response
  const rawDuration = options.duration || 20;
  const duration = Math.min(Math.max(8, rawDuration), 30);
  const totalSamples = Math.floor(sampleRate * duration);
  const numChannels = 2;

  const mood = detectMood(options.prompt);
  const prog = CHORD_PROGRESSIONS[mood];
  const secondsPerBeat = 60 / prog.bpm;
  const chordDurationSec = secondsPerBeat * 4; // 1 measure per chord
  const numChords = prog.chords.length;

  const leftChannel = new Float32Array(totalSamples);
  const rightChannel = new Float32Array(totalSamples);

  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;

    // Determine current chord index and position within the measure
    const chordIndex = Math.floor(t / chordDurationSec) % numChords;
    const chordTime = t % chordDurationSec;
    const chord = prog.chords[chordIndex];

    let sampleL = 0;
    let sampleR = 0;

    // 1. Pad / Chord synth with attack and decay
    const padEnvelope =
      Math.sin((chordTime / chordDurationSec) * Math.PI) * 0.35;
    for (let c = 0; c < chord.notes.length; c++) {
      const freq = chord.notes[c];
      const p = (c % 2 === 0 ? 0.8 : -0.8) * 0.2; // subtle stereo pan

      // Harmonic warmth: fundamental + gentle 2nd harmonic + detune chorus
      const tone =
        Math.sin(2 * Math.PI * freq * t) * 0.6 +
        Math.sin(2 * Math.PI * (freq * 1.002) * t) * 0.25 +
        Math.sin(4 * Math.PI * freq * t) * 0.15;

      sampleL += tone * padEnvelope * (0.5 + p);
      sampleR += tone * padEnvelope * (0.5 - p);
    }

    // 2. Warm Bassline
    const bassEnvelope = Math.exp(-(chordTime % secondsPerBeat) * 2.5);
    const bassTone =
      Math.sin(2 * Math.PI * chord.bass * t) * 0.7 +
      Math.sin(4 * Math.PI * chord.bass * t) * 0.3;
    sampleL += bassTone * bassEnvelope * 0.3;
    sampleR += bassTone * bassEnvelope * 0.3;

    // 3. Arpeggiated Melody
    const arpSubdivision = secondsPerBeat / 2; // 8th notes
    const arpStep = Math.floor(chordTime / arpSubdivision) % chord.notes.length;
    const arpNoteFreq = chord.notes[arpStep] * 2; // an octave higher
    const arpTime = chordTime % arpSubdivision;
    const arpEnvelope = Math.exp(-arpTime * 6.0) * 0.28;

    // Bell-like sine pluck with subtle stereo alternation
    const arpPan = Math.sin(t * 1.5) * 0.3;
    const arpTone =
      Math.sin(2 * Math.PI * arpNoteFreq * t) * 0.8 +
      Math.sin(6 * Math.PI * arpNoteFreq * t) * 0.2;

    sampleL += arpTone * arpEnvelope * (0.5 + arpPan);
    sampleR += arpTone * arpEnvelope * (0.5 - arpPan);

    // 4. Subtle ambient shimmer / warm vinyl texture
    const shimmer = Math.sin(2 * Math.PI * 880 * t + Math.sin(t * 2)) * 0.02;
    sampleL += shimmer;
    sampleR += shimmer;

    // Master fade-in (first 1.5s) and fade-out (last 2s)
    let masterEnv = 1.0;
    if (t < 1.5) {
      masterEnv = t / 1.5;
    } else if (t > duration - 2.0) {
      masterEnv = (duration - t) / 2.0;
    }

    leftChannel[i] = sampleL * masterEnv;
    rightChannel[i] = sampleR * masterEnv;
  }

  // Soft limiting & PCM 16-bit encoding
  const pcmBuffer = Buffer.alloc(totalSamples * numChannels * 2);
  for (let i = 0; i < totalSamples; i++) {
    // Soft clip using tanh
    const l = Math.tanh(leftChannel[i]);
    const r = Math.tanh(rightChannel[i]);

    const intL = Math.max(-32768, Math.min(32767, Math.floor(l * 32000)));
    const intR = Math.max(-32768, Math.min(32767, Math.floor(r * 32000)));

    pcmBuffer.writeInt16LE(intL, i * 4);
    pcmBuffer.writeInt16LE(intR, i * 4 + 2);
  }

  const header = createWavHeader(
    pcmBuffer.length,
    sampleRate,
    numChannels,
    16
  );
  return Buffer.concat([header, pcmBuffer]);
}
