import { type NextRequest, NextResponse } from "next/server"
import { env } from "@/env"
export const maxDuration = 30

export async function POST(req: NextRequest) {
  try {
    const { messages, language = "en", model = "indic-llm" } = await req.json()

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: "No messages provided" }, { status: 400 })
    }

    // Use the environment variables as configured
    const dwaniApiKey = import.meta.env.DWANI_API_KEY
    const dwaniApiBaseUrl = import.meta.env.DWANI_API_BASE_URL

    if (!dwaniApiBaseUrl) {
      return NextResponse.json({ error: "DWANI_API_BASE_URL not configured" }, { status: 500 })
    }

    if (!dwaniApiKey) {
      return NextResponse.json(
        {
          error: "DWANI_API_KEY is required",
          details: "The Gradio Space requires an API key in 'X-API-Key' header",
        },
        { status: 500 },
      )
    }

    // Get the latest user message
    const userMessage = messages[messages.length - 1]?.content || ""

    // Prepare the system prompt for government assistance
    const systemPrompt = `You are Sarathi AI, a helpful government assistant designed to help people understand and fill out government forms in ${language}. You specialize in:

1. Analyzing government forms and documents
2. Providing step-by-step guidance on how to fill out forms
3. Explaining required documents and eligibility criteria
4. Answering questions about government procedures
5. Supporting multiple Indian languages

Guidelines:
- Be patient and explain things in simple terms
- Provide practical, actionable advice
- If you're unsure about specific legal requirements, advise consulting official sources
- Be culturally sensitive and respectful
- Use clear, numbered steps when explaining processes
- Mention required documents and where to obtain them
- Respond in ${language} language when appropriate

Always aim to be helpful, accurate, and supportive in assisting citizens with their government-related needs.`

    console.log("🚀 Calling Dwani API with comprehensive endpoint discovery:", {
      baseUrl: dwaniApiBaseUrl,
      language,
      model,
      messageLength: userMessage.length,
      hasApiKey: !!dwaniApiKey,
    })

    // Comprehensive list of possible endpoints for different Gradio/HF Space configurations
    const possibleEndpoints = [
      // Standard Gradio endpoints
      "/run/predict",
      "/predict",
      "/api/predict",
      "/call/predict",

      // Gradio with function names (common pattern)
      "/run/chat",
      "/run/generate",
      "/run/inference",
      "/api/chat",
      "/api/generate",
      "/api/inference",

      // HuggingFace Space specific patterns
      "/api/v1/predict",
      "/api/v1/chat",
      "/api/v1/generate",
      "/gradio_api/predict",
      "/gradio_api/run/predict",

      // Alternative patterns
      "/inference",
      "/generate",
      "/chat",
      "/llm",
      "/model",

      // Direct API patterns
      "/",
      "/api",
      "/v1/chat/completions",
      "/chat/completions",
    ]

    let dwaniResponse: Response | null = null
    let successfulEndpoint: string | null = null
    const allErrors: any[] = []

    // Try each endpoint with different request formats
    for (const endpoint of possibleEndpoints) {
      try {
        const fullUrl = `${dwaniApiBaseUrl}${endpoint}`
        console.log(`🔍 Trying endpoint: ${fullUrl}`)

        // Try different request body formats
        const requestFormats = [
          // Gradio format
          {
            name: "gradio",
            body: {
              data: [userMessage, language, model, systemPrompt],
            },
          },
          // Simple Gradio format
          {
            name: "simple-gradio",
            body: {
              data: [userMessage],
            },
          },
          // OpenAI-compatible format
          {
            name: "openai",
            body: {
              model: model,
              messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userMessage },
              ],
              temperature: 0.7,
              max_tokens: 1000,
            },
          },
          // Simple text format
          {
            name: "text",
            body: {
              text: userMessage,
              language: language,
              model: model,
            },
          },
          // Input format
          {
            name: "input",
            body: {
              input: userMessage,
              lang: language,
              model_name: model,
            },
          },
        ]

        for (const format of requestFormats) {
          try {
            const headers: Record<string, string> = {
              "Content-Type": "application/json",
              "X-API-Key": dwaniApiKey,
            }

            const response = await fetch(fullUrl, {
              method: "POST",
              headers,
              body: JSON.stringify(format.body),
            })

            console.log(`📡 ${fullUrl} (${format.name}) responded with status:`, response.status)

            if (response.ok) {
              dwaniResponse = response
              successfulEndpoint = `${fullUrl} (${format.name})`
              console.log(`✅ Success with: ${successfulEndpoint}`)
              break
            } else {
              const errorText = await response.text()
              allErrors.push({
                endpoint: fullUrl,
                format: format.name,
                status: response.status,
                error: errorText.substring(0, 200),
              })
            }
          } catch (formatError) {
            allErrors.push({
              endpoint: fullUrl,
              format: format.name,
              error: formatError.message,
            })
          }
        }

        if (dwaniResponse?.ok) break

        // Also try with API key as query parameter
        try {
          const urlWithApiKey = `${fullUrl}?api_key=${encodeURIComponent(dwaniApiKey)}`
          const queryResponse = await fetch(urlWithApiKey, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ data: [userMessage, language, model] }),
          })

          if (queryResponse.ok) {
            dwaniResponse = queryResponse
            successfulEndpoint = `${urlWithApiKey} (query-param)`
            console.log(`✅ Success with query param: ${successfulEndpoint}`)
            break
          }
        } catch (queryError) {
          // Continue to next endpoint
        }
      } catch (error) {
        allErrors.push({
          endpoint: `${dwaniApiBaseUrl}${endpoint}`,
          error: error.message,
        })
        continue
      }
    }

    if (!dwaniResponse || !dwaniResponse.ok) {
      console.error("❌ All endpoints failed. Errors:", allErrors)

      // Provide comprehensive error information
      const errorDetails = {
        message: "All Dwani API endpoints failed",
        baseUrl: dwaniApiBaseUrl,
        totalEndpointsTried: possibleEndpoints.length,
        allErrors: allErrors.slice(-5), // Last 5 errors for debugging
        suggestion:
          "The Hugging Face Space might be using a custom endpoint structure. Please check the Space's API documentation or contact the organizers.",
        commonIssues: [
          "Space might be sleeping (HF Spaces go to sleep after inactivity)",
          "Custom endpoint not in our list",
          "Different authentication method required",
          "Space might be private or restricted",
        ],
      }

      console.log("🔄 Falling back to OpenAI API")
      return await fallbackToOpenAI(systemPrompt, userMessage, errorDetails)
    }

    // Parse the successful response
    const responseText = await dwaniResponse.text()
    console.log("📥 Raw response:", responseText.substring(0, 300))

    let responseData: any
    try {
      responseData = JSON.parse(responseText)
    } catch (parseError) {
      console.error("Failed to parse response as JSON:", parseError)

      // If it's plain text and looks like a valid response, use it
      if (responseText && responseText.length > 10 && !responseText.toLowerCase().includes("error")) {
        return NextResponse.json({
          success: true,
          message: responseText.trim(),
          model: model,
          language: language,
          source: "dwani-text-response",
          endpoint_used: successfulEndpoint,
        })
      }

      console.log("🔄 Response parsing failed, falling back to OpenAI")
      return await fallbackToOpenAI(systemPrompt, userMessage, { parseError: parseError.message })
    }

    // Extract the response from various possible formats
    const assistantMessage =
      responseData.data?.[0] || // Gradio format
      responseData.data || // Direct data
      responseData.choices?.[0]?.message?.content || // OpenAI format
      responseData.response || // Simple response
      responseData.text || // Text format
      responseData.output || // Output format
      responseData.result || // Result format
      responseData.generated_text || // Generated text
      responseData.content || // Content format
      responseData.message || // Message format
      "I apologize, but I couldn't generate a response from the Dwani service."

    console.log("✅ Successfully extracted response:", assistantMessage.substring(0, 100))

    return NextResponse.json({
      success: true,
      message: assistantMessage,
      model: model,
      language: language,
      source: "dwani-api",
      endpoint_used: successfulEndpoint,
      response_format: Object.keys(responseData),
    })
  } catch (error) {
    console.error("Dwani API error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error.message,
      },
      { status: 500 },
    )
  }
}

// Enhanced fallback function with error details
async function fallbackToOpenAI(systemPrompt: string, userMessage: string, errorDetails?: any) {
  try {
    const { openai } = await import("@ai-sdk/openai")
    const { streamText } = await import("ai")

    console.log("🤖 Using OpenAI fallback due to Dwani API issues:", errorDetails)

    const result = streamText({
      model: openai("gpt-4o"),
      system: systemPrompt + "\n\nNote: I'm currently using OpenAI as the Dwani LLM service is unavailable.",
      messages: [{ role: "user", content: userMessage }],
      temperature: 0.7,
    })

    return result.toDataStreamResponse()
  } catch (openaiError) {
    console.error("OpenAI fallback also failed:", openaiError)
    return NextResponse.json(
      {
        error: "Both Dwani and OpenAI APIs failed",
        dwaniError: errorDetails,
        openaiError: openaiError.message,
      },
      { status: 500 },
    )
  }
}

// GET endpoint for Dwani LLM status and configuration check
export async function GET() {
  const dwaniApiKey = process.env.DWANI_API_KEY
  const dwaniApiBaseUrl = process.env.DWANI_API_BASE_URL

  return NextResponse.json({
    status: "active",
    service: "dwani-comprehensive-discovery",
    space_url: dwaniApiBaseUrl,
    configured: {
      apiKey: !!dwaniApiKey,
      baseUrl: !!dwaniApiBaseUrl,
      endpoint: dwaniApiBaseUrl || "not configured",
    },
    supported_languages: ["en", "hi", "kn", "ta", "te", "bn", "gu", "mr", "pa", "or"],
    models: ["indic-llm", "indic-chat", "government-assistant"],
    endpoint_discovery: {
      total_endpoints_tried: 20,
      formats_tried: ["gradio", "openai", "text", "input"],
      authentication_methods: ["X-API-Key header", "api_key query parameter"],
    },
    troubleshooting: {
      common_issues: [
        "HuggingFace Space sleeping",
        "Custom endpoint structure",
        "Authentication method mismatch",
        "Private/restricted Space",
      ],
      solutions: [
        "Visit the Space URL to wake it up",
        "Check Space documentation for API structure",
        "Verify API key with organizers",
        "Use endpoint debugger tool",
      ],
    },
    message: "Comprehensive Dwani API endpoint discovery with fallback",
  })
}
