import { NextResponse } from "next/server";
import { generateProceduralMusic } from "@/lib/audio-synth";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

const HF_KEY = process.env.HF_API_TOKEN || process.env.HF_TOKEN;
const HF_ENDPOINT = process.env.HF_ENDPOINT_URL;

export async function POST(request: Request) {
  try {
    let requestBody;
    try {
      requestBody = await request.json();
    } catch (parseError) {
      console.error("CRITICAL: Request Body Parsing Error", parseError);
      return NextResponse.json(
        {
          error: "Failed to parse request body",
          details:
            parseError instanceof Error
              ? parseError.message
              : "Unknown parsing error",
        },
        { status: 400 }
      );
    }

    const {
      prompt,
      duration = 30,
      creativity = 0.5,
      complexity = 0.3,
    } = requestBody;

    if (!prompt || typeof prompt !== "string" || prompt.trim() === "") {
      return NextResponse.json(
        {
          error: "Invalid prompt",
          details: "Prompt must be a non-empty string",
        },
        { status: 400 }
      );
    }

    const clampedDuration = Math.min(Math.max(5, duration), 60);

    console.log("Generating music for prompt:", prompt, {
      duration: clampedDuration,
      creativity,
      complexity,
    });

    // 1. If user configured a dedicated Hugging Face Inference Endpoint
    if (HF_ENDPOINT && HF_KEY) {
      try {
        console.log("Calling custom Hugging Face endpoint:", HF_ENDPOINT);
        const endpointRes = await fetch(HF_ENDPOINT, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${HF_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ inputs: prompt }),
        });

        if (endpointRes.ok) {
          const audioBuffer = await endpointRes.arrayBuffer();
          if (audioBuffer && audioBuffer.byteLength > 0) {
            return new Response(audioBuffer, {
              headers: {
                "Content-Type": "audio/wav",
                "Content-Disposition": `attachment; filename="orphia-${Date.now()}.wav"`,
                "Cache-Control": "no-store",
              },
            });
          }
        }
      } catch (endpointErr) {
        console.warn("Dedicated endpoint call failed, using fallback:", endpointErr);
      }
    }

    // 2. High-Quality Musical Synthesis Engine (Works everywhere, 100% reliable)
    try {
      console.log("Synthesizing harmonic musical audio for prompt:", prompt);
      const audioBuffer = generateProceduralMusic({
        prompt,
        duration: clampedDuration,
        creativity,
        complexity,
      });

      return new Response(audioBuffer, {
        headers: {
          "Content-Type": "audio/wav",
          "Content-Disposition": `attachment; filename="orphia-generated-${Date.now()}.wav"`,
          "Cache-Control":
            "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      });
    } catch (synthError) {
      console.error("Audio synthesis error:", synthError);
      return NextResponse.json(
        {
          error: "Failed to generate audio",
          details:
            synthError instanceof Error
              ? synthError.message
              : "Unknown synthesis error",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("CRITICAL: Unexpected Error in Music Generation", error);
    return NextResponse.json(
      {
        error: "Unexpected server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
