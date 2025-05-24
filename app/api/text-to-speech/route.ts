import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { text, language = "en", speed = 1.0, pitch = 1.0 } = await req.json()

    if (!text) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 })
    }

    console.log(`TTS Request: "${text.substring(0, 50)}..." in ${language}`)

    // For now, return a response that tells the client to use browser TTS
    // This ensures TTS works immediately while we can add Dwhani integration later
    return NextResponse.json({
      success: true,
      method: "browser_tts",
      text: text,
      language: language,
      speed: speed,
      pitch: pitch,
      message: "Using browser text-to-speech",
    })
  } catch (error) {
    console.error("TTS API error:", error)
    return NextResponse.json(
      {
        error: "TTS service error",
        method: "browser_tts",
        text: "",
        language: "en",
      },
      { status: 500 },
    )
  }
}

// GET endpoint for TTS status
export async function GET() {
  return NextResponse.json({
    status: "active",
    method: "browser_tts",
    supported_languages: ["en", "hi", "kn", "ta", "te", "bn", "gu", "mr", "pa", "or"],
    message: "Text-to-speech service is running with browser fallback",
  })
}
