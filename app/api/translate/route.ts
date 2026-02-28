// app/api/translate/route.ts
import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { text, targetLanguage } = await request.json();

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const languageMap: Record<string, string> = {
      "es-ES": "Spanish",
      "fr-FR": "French",
      "zh-CN": "Chinese (Simplified)",
      "ar-SA": "Arabic",
      "hi-IN": "Hindi",
      "tl-PH": "Tagalog (Filipino)",
      "pa-IN": "Punjabi",
      "en-US": "English"
    };

    const targetLangName = languageMap[targetLanguage] || "English";

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `Translate the following text to ${targetLangName}. Return ONLY the translation, no explanations or extra text.

Text to translate: ${text}`
        }
      ],
    });

    const translatedText = message.content[0].type === "text" 
      ? message.content[0].text 
      : text;

    return NextResponse.json({ translatedText });
  } catch (error) {
    console.error("Translation error:", error);
    return NextResponse.json(
      { error: "Translation failed" },
      { status: 500 }
    );
  }
}