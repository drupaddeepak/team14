"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Loader2, ExternalLink, Search, AlertTriangle, Coffee } from "lucide-react"

export function DwaniSpaceInspector() {
  const [spaceUrl, setSpaceUrl] = useState("https://dwani-amoghavarsha.hf.space")
  const [apiKey, setApiKey] = useState("")
  const [isInspecting, setIsInspecting] = useState(false)
  const [spaceInfo, setSpaceInfo] = useState<any>(null)
  const [endpointResults, setEndpointResults] = useState<any[]>([])
  const [workingEndpoint, setWorkingEndpoint] = useState<string | null>(null)

  const inspectSpace = async () => {
    setIsInspecting(true)
    setSpaceInfo(null)
    setEndpointResults([])
    setWorkingEndpoint(null)

    try {
      // First, try to get basic info about the space
      console.log("🔍 Inspecting Hugging Face Space...")

      // Check if space is accessible
      const spaceResponse = await fetch(spaceUrl, { method: "GET" })
      const spaceHtml = await spaceResponse.text()

      const info = {
        accessible: spaceResponse.ok,
        status: spaceResponse.status,
        isGradio: spaceHtml.includes("gradio") || spaceHtml.includes("Gradio"),
        hasAPI: spaceHtml.includes("/api/") || spaceHtml.includes("api_name"),
        title: spaceHtml.match(/<title>(.*?)<\/title>/)?.[1] || "Unknown",
        sleeping: spaceHtml.includes("sleeping") || spaceHtml.includes("Building"),
      }

      setSpaceInfo(info)

      if (info.sleeping) {
        console.log("😴 Space appears to be sleeping, trying to wake it up...")
        // Visit the space to wake it up
        await fetch(spaceUrl, { method: "GET" })
        await new Promise((resolve) => setTimeout(resolve, 3000)) // Wait 3 seconds
      }

      // Now test various endpoints
      const endpoints = [
        "/run/predict",
        "/predict",
        "/api/predict",
        "/call/predict",
        "/run/chat",
        "/run/generate",
        "/api/chat",
        "/api/generate",
        "/inference",
        "/generate",
        "/chat",
        "/api",
        "/",
      ]

      const results = []

      for (const endpoint of endpoints) {
        try {
          const fullUrl = `${spaceUrl}${endpoint}`
          console.log(`Testing: ${fullUrl}`)

          // Test with minimal Gradio format
          const testBody = {
            data: ["Hello, this is a test message"],
          }

          const headers: Record<string, string> = {
            "Content-Type": "application/json",
          }

          if (apiKey) {
            headers["X-API-Key"] = apiKey
          }

          const response = await fetch(fullUrl, {
            method: "POST",
            headers,
            body: JSON.stringify(testBody),
          })

          const responseText = await response.text()
          let responseData

          try {
            responseData = JSON.parse(responseText)
          } catch {
            responseData = { raw: responseText }
          }

          const result = {
            endpoint,
            fullUrl,
            status: response.status,
            success: response.ok,
            response: responseText.substring(0, 200),
            hasData: !!responseData.data,
            error: response.ok ? null : responseText,
          }

          results.push(result)

          if (response.ok && !workingEndpoint) {
            setWorkingEndpoint(fullUrl)
          }

          // Update UI progressively
          setEndpointResults([...results])
        } catch (error) {
          results.push({
            endpoint,
            fullUrl: `${spaceUrl}${endpoint}`,
            status: null,
            success: false,
            error: error.message,
          })
          setEndpointResults([...results])
        }
      }
    } catch (error) {
      console.error("Space inspection failed:", error)
    } finally {
      setIsInspecting(false)
    }
  }

  const wakeUpSpace = async () => {
    try {
      console.log("☕ Attempting to wake up the space...")
      await fetch(spaceUrl, { method: "GET" })
      alert("Space wake-up request sent! Wait a few seconds and try again.")
    } catch (error) {
      alert("Failed to wake up space: " + error.message)
    }
  }

  const openSpace = () => {
    window.open(spaceUrl, "_blank")
  }

  const copyWorkingConfig = () => {
    if (workingEndpoint) {
      const config = `# Working Dwani Configuration
DWANI_API_KEY=${apiKey || "your_api_key_here"}
DWANI_API_BASE_URL=${spaceUrl}

# Working endpoint found: ${workingEndpoint}
# Space status: ${spaceInfo?.accessible ? "Accessible" : "Not accessible"}
# Gradio detected: ${spaceInfo?.isGradio ? "Yes" : "No"}`

      navigator.clipboard.writeText(config)
      alert("📋 Configuration copied to clipboard!")
    }
  }

  return (
    <Card className="w-full max-w-6xl border-orange-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="w-5 h-5" />
          Dwani Space Inspector
          <Badge variant="outline" className="ml-auto">
            Diagnostic Tool
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Input Section */}
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
              <Button onClick={openSpace} variant="outline" size="sm">
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="api-key">API Key (optional):</Label>
            <Input
              id="api-key"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter API key if required"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={inspectSpace}
            disabled={isInspecting || !spaceUrl}
            className="flex-1 bg-orange-500 hover:bg-orange-600"
          >
            {isInspecting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Inspecting Space...
              </>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                Inspect Space & Test Endpoints
              </>
            )}
          </Button>
          <Button onClick={wakeUpSpace} variant="outline">
            <Coffee className="w-4 h-4 mr-2" />
            Wake Up Space
          </Button>
        </div>

        {/* Space Information */}
        {spaceInfo && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              {spaceInfo.accessible ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <XCircle className="w-4 h-4 text-red-500" />
              )}
              <span className="text-sm">Accessible</span>
            </div>
            <div className="flex items-center gap-2">
              {spaceInfo.isGradio ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <XCircle className="w-4 h-4 text-red-500" />
              )}
              <span className="text-sm">Gradio Detected</span>
            </div>
            <div className="flex items-center gap-2">
              {spaceInfo.hasAPI ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <XCircle className="w-4 h-4 text-red-500" />
              )}
              <span className="text-sm">API Available</span>
            </div>
            <div className="flex items-center gap-2">
              {spaceInfo.sleeping ? (
                <AlertTriangle className="w-4 h-4 text-yellow-500" />
              ) : (
                <CheckCircle className="w-4 h-4 text-green-500" />
              )}
              <span className="text-sm">{spaceInfo.sleeping ? "Sleeping" : "Active"}</span>
            </div>
          </div>
        )}

        {/* Working Endpoint */}
        {workingEndpoint && (
          <div className="bg-green-50 border border-green-200 p-4 rounded-md">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-green-800">✅ Working Endpoint Found!</h4>
                <code className="text-sm text-green-700">{workingEndpoint}</code>
              </div>
              <Button onClick={copyWorkingConfig} variant="outline" size="sm">
                Copy Config
              </Button>
            </div>
          </div>
        )}

        {/* Endpoint Test Results */}
        {endpointResults.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Endpoint Test Results:</h3>
            <div className="grid gap-2 max-h-96 overflow-y-auto">
              {endpointResults.map((result, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-md border text-sm ${
                    result.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {result.success ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                    <code className="font-mono">{result.endpoint}</code>
                    {result.status && (
                      <Badge variant="outline" className="text-xs">
                        {result.status}
                      </Badge>
                    )}
                  </div>
                  {result.response && (
                    <div className="text-xs bg-white p-2 rounded mt-1">
                      <strong>Response:</strong> {result.response}
                    </div>
                  )}
                  {result.error && (
                    <div className="text-xs text-red-600 mt-1">
                      <strong>Error:</strong> {result.error}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
          <h4 className="text-sm font-medium text-blue-800 mb-2">Troubleshooting Guide:</h4>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• If the space is sleeping, click "Wake Up Space" and wait a few minutes</li>
            <li>• If no endpoints work, the space might use a custom API structure</li>
            <li>• Check the space's README or documentation for API details</li>
            <li>• Contact the organizers for the correct endpoint and API key</li>
            <li>• Some spaces require specific input formats or authentication</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
