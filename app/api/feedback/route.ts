import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const TELEGRAM_BOT_TOKEN =
  process.env.TELEGRAM_BOT_TOKEN ||
  "8708785372:AAENnhEdBeJC5t-mHJ4EFNMSpA3JTs6U_l0";
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || "5911928417";
const NOTIFICATION_EMAIL =
  process.env.EMAIL_ADDRESS || "gousk2004@gmail.com";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, title, description, name, email } = body;

    if (!title || !description) {
      return NextResponse.json(
        { error: "Title and description are required." },
        { status: 400 }
      );
    }

    const isBug = type === "bug";
    const emoji = isBug ? "🐛" : "💡";
    const label = isBug ? "BUG REPORT" : "FEATURE SUGGESTION";

    const escapeHtml = (str: string) =>
      str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

    const safeTitle = escapeHtml(title.trim());
    const safeDesc = escapeHtml(description.trim());
    const safeName = name ? escapeHtml(name.trim()) : "Anonymous User";
    const safeEmail = email ? escapeHtml(email.trim()) : "Not provided";
    const timestamp = new Date().toLocaleString("en-US", {
      timeZone: "Asia/Kolkata",
    });

    const telegramMessage = `${emoji} <b>[ORPHIA ${label}]</b>\n\n` +
      `<b>📌 Title:</b> ${safeTitle}\n\n` +
      `<b>📝 Details:</b>\n${safeDesc}\n\n` +
      `<b>👤 User:</b> ${safeName}\n` +
      `<b>📧 Email:</b> ${safeEmail}\n` +
      `<b>🕒 Time:</b> ${timestamp} (IST)\n` +
      `<b>✉️ Admin:</b> ${NOTIFICATION_EMAIL}`;

    let telegramSuccess = false;
    let telegramError = null;

    if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
      try {
        const tgRes = await fetch(
          `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: TELEGRAM_CHAT_ID,
              text: telegramMessage,
              parse_mode: "HTML",
            }),
          }
        );

        const tgData = await tgRes.json();
        if (tgData.ok) {
          telegramSuccess = true;
        } else {
          console.error("Telegram API Error:", tgData);
          telegramError = tgData.description;
        }
      } catch (err) {
        console.error("Telegram fetch exception:", err);
        telegramError = err instanceof Error ? err.message : "Network error";
      }
    }

    return NextResponse.json({
      success: true,
      deliveredToTelegram: telegramSuccess,
      telegramError,
      message: isBug
        ? "Thank you! Your bug report has been forwarded directly to our engineering team."
        : "Thank you! Your feature idea has been shared directly with our creator.",
    });
  } catch (error) {
    console.error("Feedback submission error:", error);
    return NextResponse.json(
      {
        error: "Failed to submit feedback",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
