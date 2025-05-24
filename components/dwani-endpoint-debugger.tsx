"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Search, CheckCircle, XCircle, Loader2, ExternalLink } from "lucide-react"

export function DwaniEndpointDebugger() {
  const [baseUrl, setBaseUrl] = useState("https://dwani-amoghavarsha.hf.space")
  const [testResults, setTestResults] = useState<
    Array<{
      endpoint: string
      status: number | null
      success: boolean
      error?: string
      response?: string
    }>
  >([])
  const [isTestingAll, setIsTestingAll] = useState(false)

  const commonEndpoints = [
    "/predict",
    "/api/predict",
    "/api/v1/predict",
    "/run/predict",
    "/call/predict",
    "/api/predict/",
    "/gradio_api/predict",
    "/generate",
    "/api/generate",
    "/v1/chat/completions",
    "/chat/completions",
    "/api/v1/generate",
    "/llm/generate",
    "/api",
    "/",
  ]

  const testSingleEndpoint = async (endpoint: string) => {
    try {
      const fullUrl = `${baseUrl}${endpoint}`

      // Try a simple GET request first
      const getResponse = await fetch(fullUrl, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      })

      if (getResponse.ok) {
        const text = await getResponse.text()
        return {
          endpoint,
          status: getResponse.status,
          success: true,
          response: text.substring(0, 200),
        }
      }

      // If GET fails, try POST with sample data
      const postResponse = await fetch(fullUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: ["Hello, test message", "en", "indic-llm"],
          text: "Hello, test message",
          input: "Hello, test message",
          query: "Hello, test message",
          messages: [{ role: "user", content: "Hello, test message" }],
        }),
      })

      const text = await postResponse.text()

      return {
        endpoint,
        status: postResponse.status,
        success: postResponse.ok,
        response: text.substring(0, 200),
        error: postResponse.ok ? undefined : text,
      }
    } catch (error) {
      return {
        endpoint,
        status: null,
        success: false,
        error: error.message,
      }
    }
  }

  const testAllEndpoints = async () => {
    setIsTestingAll(true)
    setTestResults([])

    const results = []
    for (const endpoint of commonEndpoints) {
      console.log(`Testing endpoint: ${baseUrl}${endpoint}`)
      const result = await testSingleEndpoint(endpoint)
      results.push(result)
      setTestResults([...results]) // Update UI progressively
    }

    setIsTestingAll(false)
  }

  const openHuggingFaceSpace = () => {
    window.open(baseUrl, "_blank")
  }

  return (
    <Card className="w-full max-w-4xl border-orange-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="w-5 h-5" />
          Dwani API Endpoint Debugger
          <Badge variant="outline" className="ml-auto">
            Debug Tool
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Base URL Input */}
        <div className="space-y-2">
          <Label htmlFor="base-url">Base URL:</Label>
          <div className="flex gap-2">
            <Input
              id="base-url"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="https://dwani-amoghavarsha.hf.space"
              className="flex-1"
            />
            <Button onClick={openHuggingFaceSpace} variant="outline" size="sm">
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Test Button */}
        <Button
          onClick={testAllEndpoints}
          disabled={isTestingAll || !baseUrl}
          className="w-full bg-orange-500 hover:bg-orange-600"
        >
          {isTestingAll ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Testing Endpoints...
            </>
          ) : (
            <>
              <Search className="w-4 h-4 mr-2" />
              Test All Common Endpoints
            </>
          )}
        </Button>

        {/* Results */}
        {testResults.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Test Results:</h3>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-md border ${
                    result.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {result.success ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                    <code className="text-sm font-mono">
                      {baseUrl}
                      {result.endpoint}
                    </code>
                    {result.status && (
                      <Badge variant="outline" className="text-xs">
                        {result.status}
                      </Badge>
                    )}
                  </div>

                  {result.response && (
                    <div className="text-xs bg-white p-2 rounded border">
                      <strong>Response:</strong>
                      <pre className="mt-1 whitespace-pre-wrap">{result.response}</pre>
                    </div>
                  )}

                  {result.error && (
                    <div className="text-xs text-red-600">
                      <strong>Error:</strong> {result.error}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Working Endpoints Summary */}
            {testResults.some((r) => r.success) && (
              <div className="bg-green-50 p-3 rounded-md border border-green-200">
                <h4 className="text-sm font-medium text-green-800 mb-2">✅ Working Endpoints Found:</h4>
                <div className="space-y-1">
                  {testResults
                    .filter((r) => r.success)
                    .map((result, index) => (
                      <code key={index} className="block text-xs text-green-700">
                        {baseUrl}
                        {result.endpoint}
                      </code>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 p-3 rounded-md border border-blue-200">
          <h4 className="text-sm font-medium text-blue-800 mb-2">Instructions:</h4>
          <ol className="text-xs text-blue-700 space-y-1">
            <li>1. Enter the Hugging Face Space URL above</li>
            <li>2. Click "Test All Common Endpoints" to find working endpoints</li>
            <li>3. Check the results to see which endpoints respond successfully</li>
            <li>4. Use the working endpoint to update your DWANI_API_BASE_URL</li>
            <li>5. Contact organizers if no endpoints work</li>
          </ol>
        </div>

        {/* Current Environment */}
        <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
          <strong>Current Environment:</strong>
          <br />
          DWANI_API_BASE_URL: {baseUrl}
          <br />
          <strong>Note:</strong> This tool helps identify the correct API endpoint structure
        </div>
      </CardContent>
    </Card>
  )
}
