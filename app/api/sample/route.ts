import { NextRequest, NextResponse } from "next/server";
import { transformSampleMusic } from "@/lib/audio-synth";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

const HF_KEY = process.env.HF_API_TOKEN || process.env.HF_TOKEN;
const HF_ENDPOINT = process.env.HF_ENDPOINT_URL;
const MAX_FILE_SIZE_BYTES = 4.2 * 1024 * 1024; // 4.2MB (Vercel Serverless hard limit is 4.5MB)

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const audioFile = formData.get("audio") as File | null;
    const prompt = (formData.get("prompt") as string) || "";
    const duration = parseInt((formData.get("duration") as string) || "30");
    const sampleInfluence = parseInt(
      (formData.get("sampleInfluence") as string) || "70"
    );
    const transformationStyle = parseInt(
      (formData.get("transformationStyle") as string) || "50"
    );

    if (!audioFile) {
      return NextResponse.json(
        { error: "No audio file provided" },
        { status: 400 }
      );
    }

    if (audioFile.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        {
          error: `Audio sample is too large (${(
            audioFile.size /
            1024 /
            1024
          ).toFixed(1)}MB). Maximum allowed is 4MB. Please use a shorter sample.`,
        },
        { status: 413 }
      );
    }

    const clampedDuration = Math.min(Math.max(5, duration), 60);
    const arrayBuffer = await audioFile.arrayBuffer();
    const sampleBuffer = Buffer.from(arrayBuffer);

    console.log("Processing audio sample transformation:", {
      fileName: audioFile.name,
      fileSize: audioFile.size,
      prompt,
      duration: clampedDuration,
      sampleInfluence,
      transformationStyle,
    });

    // 1. If user configured a dedicated Hugging Face endpoint that is active
    if (HF_ENDPOINT && HF_KEY) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 12000); // 12s timeout

        const response = await fetch(HF_ENDPOINT, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${HF_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            inputs: prompt || "Extend this musical sample",
          }),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (response.ok) {
          const audioBlob = await response.blob();
          if (audioBlob && audioBlob.size > 0) {
            return new NextResponse(audioBlob, {
              headers: {
                "Content-Type": audioBlob.type || "audio/wav",
                "Content-Disposition": `attachment; filename="orphia-sample-${Date.now()}.wav"`,
                "Cache-Control": "no-store, no-cache, must-revalidate",
              },
            });
          }
        }
      } catch (endpointErr) {
        console.warn(
          "Dedicated endpoint call timed out or failed, using high-speed sample transformer engine:",
          endpointErr
        );
      }
    }

    // 2. High-Performance Audio Sample Transformer & Accompaniment Engine
    try {
      const compositeAudio = transformSampleMusic({
        sampleBuffer,
        prompt,
        duration: clampedDuration,
        sampleInfluence,
        transformationStyle,
      });

      return new Response(compositeAudio, {
        headers: {
          "Content-Type": "audio/wav",
          "Content-Disposition": `attachment; filename="orphia-sample-${Date.now()}.wav"`,
          "Cache-Control":
            "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      });
    } catch (synthErr) {
      console.error("Sample transformation synthesis error:", synthErr);
      return NextResponse.json(
        {
          error: "Failed to process and transform sample",
          details:
            synthErr instanceof Error
              ? synthErr.message
              : "Unknown synthesis error",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("CRITICAL: Error processing sample request:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "An unknown error occurred processing the request.",
      },
      { status: 500 }
    );
  }
}
