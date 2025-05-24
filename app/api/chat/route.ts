import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const data = await req.json()
    
    const response = await fetch("http://localhost:5000/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error("Failed to get response from backend")
    }

    const result = await response.json()
    return NextResponse.json(result)
  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}
