"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Loader2, ExternalLink, Play, Key } from "lucide-react"

export function DwaniGradioTester() {
  const [spaceUrl, setSpaceUrl] = useState("https://dwani-amoghavarsha.hf.space")
  const [apiKey, setApiKey] = useState("")
  const [testInput, setTestInput] = useState("How do I apply for a passport in India?")
  const [language, setLanguage] = useState("en")
  const [model, setModel] = useState("indic-llm")
  const [testResult, setTestResult] = useState<{
    success: boolean
    endpoint?: string
    response?: string
    error?: string
    status?: number
    rawResponse?: any
    authMethod?: string
  } | null>(null)
  const [isTesting, setIsTesting] = useState(false)

  const testGradioEndpoint = async (endpoint: string, useQueryParam = false) => {
    try {
      let fullUrl = `${spaceUrl}${endpoint}`

      if (useQueryParam && apiKey) {
        fullUrl += `?api_key=${encodeURIComponent(apiKey)}`
      }

      console.log(`🧪 Testing Gradio endpoint: ${fullUrl}`)

      // Gradio API format
      const requestBody = {
        data: [testInput, language, model, "You are a helpful government assistant."],
      }

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      }

      // Add API key to header if not using query param
      if (!useQueryParam && apiKey) {
        headers["X-API-Key"] = apiKey
      }

      const response = await fetch(fullUrl, {
        method: "POST",
        headers,
        body: JSON.stringify(requestBody),
      })

      const responseText = await response.text()
      let responseData

      try {
        responseData = JSON.parse(responseText)
      } catch {
        responseData = { raw: responseText }
      }

      return {
        success: response.ok,
        endpoint: fullUrl,
        status: response.status,
        response: responseData.data?.[0] || responseData.data || responseText,
        rawResponse: responseData,
        error: response.ok ? undefined : responseText,
        authMethod: useQueryParam ? "Query Parameter" : "X-API-Key Header",
      }
    } catch (error) {
      return {
        success: false,
        endpoint: `${spaceUrl}${endpoint}`,
        error: error.message,
        authMethod: useQueryParam ? "Query Parameter" : "X-API-Key Header",
      }
    }
  }

  const runGradioTest = async () => {
    setIsTesting(true)
    setTestResult(null)

    if (!apiKey) {
      setTestResult({
        success: false,
        error: "API key is required. Please enter your DWANI_API_KEY.",
      })
      setIsTesting(false)
      return
    }

    // Try Gradio endpoints in order of likelihood
    const gradioEndpoints = ["/run/predict", "/predict", "/api/predict", "/call/predict"]

    // Try with X-API-Key header first
    for (const endpoint of gradioEndpoints) {
      console.log(`Testing endpoint with header: ${endpoint}`)
      const result = await testGradioEndpoint(endpoint, false)

      if (result.success) {
        setTestResult(result)
        setIsTesting(false)
        return
      }
    }

    // If header method failed, try with query parameter
    for (const endpoint of gradioEndpoints) {
      console.log(`Testing endpoint with query param: ${endpoint}`)
      const result = await testGradioEndpoint(endpoint, true)

      if (result.success) {
        setTestResult(result)
        setIsTesting(false)
        return
      }
    }

    // If all failed, show the last error
    const lastResult = await testGradioEndpoint("/run/predict", false)
    setTestResult(lastResult)
    setIsTesting(false)
  }

  const openGradioSpace = () => {
    window.open(spaceUrl, "_blank")
  }

  const copyWorkingConfig = () => {
    if (testResult?.success && testResult.endpoint) {
      const config = `# Working Dwani Configuration
DWANI_API_KEY=${apiKey}
DWANI_API_BASE_URL=${spaceUrl}

# Test successful with endpoint: ${testResult.endpoint}
# Authentication method: ${testResult.authMethod}
# Request format: {"data": ["input", "language", "model", "system_prompt"]}
# Response format: {"data": ["response"]}`

      navigator.clipboard.writeText(config)
      alert("📋 Working configuration copied to clipboard!")
    }
  }

  const loadFromEnv = () => {
    // This would typically load from your environment variables
    setApiKey("your_dwani_api_key_here")
    alert("💡 Please replace with your actual DWANI_API_KEY from the organizers")
  }

  return (
    <Card className="w-full max-w-4xl border-orange-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Play className="w-5 h-5" />
          Dwani Gradio Space Tester
          <Badge variant="outline" className="ml-auto">
            API Key Required
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* API Key Warning */}
        <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-md">
          <div className="flex items-center gap-2 text-yellow-800 text-sm">
            <Key className="w-4 h-4" />
            <span>API Key Required: The Gradio Space requires authentication</span>
          </div>
        </div>

        {/* Space URL and API Key */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="space-url">Hugging Face Space URL:</Label>
            <div className="flex gap-2">
              <Input
                id="space-url"
                value={spaceUrl}
                onChange={(e) => setSpaceUrl(e.target.value)}
                placeholder="https://dwani-amoghavarsha.hf.space"
                className="flex-1"
              />
              <Button onClick={openGradioSpace} variant="outline" size="sm">
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="api-key">DWANI API Key:</Label>
            <div className="flex gap-2">
              <Input
                id="api-key"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your DWANI_API_KEY"
                className="flex-1"
              />
              <Button onClick={loadFromEnv} variant="outline" size="sm">
                <Key className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Test Input */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="test-input">Test Input:</Label>
            <Textarea
              id="test-input"
              value={testInput}
              onChange={(e) => setTestInput(e.target.value)}
              placeholder="Enter a test question..."
              className="min-h-[80px]"
            />
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="language">Language:</Label>
              <Input id="language" value={language} onChange={(e) => setLanguage(e.target.value)} placeholder="en" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="model">Model:</Label>
              <Input id="model" value={model} onChange={(e) => setModel(e.target.value)} placeholder="indic-llm" />
            </div>
          </div>
        </div>

        {/* Test Button */}
        <Button
          onClick={runGradioTest}
          disabled={isTesting || !spaceUrl || !testInput || !apiKey}
          className="w-full bg-orange-500 hover:bg-orange-600"
        >
          {isTesting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Testing Gradio API with Authentication...
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-2" />
              Test Gradio API with API Key
            </>
          )}
        </Button>

        {/* Test Results */}
        {testResult && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Test Results:</h3>

            <div
              className={`p-4 rounded-md border ${
                testResult.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
              }`}
            >
              <div className="flex items-center gap-2 mb-3">
                {testResult.success ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
                <span className="font-medium">{testResult.success ? "✅ Success!" : "❌ Failed"}</span>
                {testResult.status && (
                  <Badge variant="outline" className="ml-auto">
                    HTTP {testResult.status}
                  </Badge>
                )}
              </div>

              {testResult.authMethod && (
                <div className="mb-3">
                  <strong>Authentication Method:</strong>
                  <Badge variant="outline" className="ml-2">
                    {testResult.authMethod}
                  </Badge>
                </div>
              )}

              {testResult.endpoint && (
                <div className="mb-3">
                  <strong>Endpoint:</strong>
                  <code className="block bg-white p-2 rounded mt-1 text-sm break-all">{testResult.endpoint}</code>
                </div>
              )}

              {testResult.response && (
                <div className="mb-3">
                  <strong>Response:</strong>
                  <div className="bg-white p-3 rounded mt-1 text-sm border">
                    <pre className="whitespace-pre-wrap">{testResult.response}</pre>
                  </div>
                </div>
              )}

              {testResult.error && (
                <div className="mb-3">
                  <strong>Error:</strong>
                  <div className="bg-white p-3 rounded mt-1 text-sm border text-red-600">
                    <pre className="whitespace-pre-wrap">{testResult.error}</pre>
                  </div>
                </div>
              )}

              {testResult.rawResponse && (
                <details className="mt-3">
                  <summary className="cursor-pointer text-sm font-medium">Raw Response (Debug)</summary>
                  <div className="bg-gray-100 p-3 rounded mt-2 text-xs">
                    <pre>{JSON.stringify(testResult.rawResponse, null, 2)}</pre>
                  </div>
                </details>
              )}

              {testResult.success && (
                <Button onClick={copyWorkingConfig} variant="outline" size="sm" className="mt-3">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Copy Working Config
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Expected Format with API Key */}
        <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
          <h4 className="text-sm font-medium text-blue-800 mb-2">Expected Gradio Format with API Key:</h4>
          <div className="space-y-2 text-xs text-blue-700">
            <div>
              <strong>Headers:</strong>
              <code className="block bg-white p-2 rounded mt-1">
                {JSON.stringify({ "Content-Type": "application/json", "X-API-Key": "your_api_key" }, null, 2)}
              </code>
            </div>
            <div>
              <strong>Request Body:</strong>
              <code className="block bg-white p-2 rounded mt-1">
                {JSON.stringify({ data: [testInput, language, model, "system_prompt"] }, null, 2)}
              </code>
            </div>
            <div>
              <strong>Alternative (Query Param):</strong>
              <code className="block bg-white p-2 rounded mt-1">POST {spaceUrl}/run/predict?api_key=your_api_key</code>
            </div>
          </div>
        </div>

        {/* Setup Instructions */}
        <div className="bg-orange-50 p-4 rounded-md border border-orange-200">
          <h4 className="text-sm font-medium text-orange-800 mb-2">Setup Instructions:</h4>
          <ol className="text-xs text-orange-700 space-y-1">
            <li>1. Get your DWANI_API_KEY from the organizers</li>
            <li>
              2. Add it to your .env.local file: <code>DWANI_API_KEY=your_key_here</code>
            </li>
            <li>
              3. Set the Space URL: <code>DWANI_API_BASE_URL=https://dwani-amoghavarsha.hf.space</code>
            </li>
            <li>4. Restart your development server</li>
            <li>5. Test the connection using this tool</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  )
}
