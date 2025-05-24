"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Settings, Copy } from "lucide-react"
import { DwaniRepositoryInfo } from "./dwani-repository-info"

export function DwaniSetup() {
  const [config, setConfig] = useState({
    apiKey: "",
    baseUrl: "",
    configured: false,
    tested: false,
  })

  const [isChecking, setIsChecking] = useState(false)

  useEffect(() => {
    checkConfiguration()
  }, [])

  const checkConfiguration = async () => {
    setIsChecking(true)
    try {
      const response = await fetch("/api/chat-dwani")
      const data = await response.json()

      setConfig((prev) => ({
        ...prev,
        configured: data.configured?.apiKey && data.configured?.baseUrl,
        baseUrl: data.configured?.endpoint || "",
      }))
    } catch (error) {
      console.error("Failed to check configuration:", error)
    } finally {
      setIsChecking(false)
    }
  }

  const testConnection = async () => {
    setIsChecking(true)
    try {
      const response = await fetch("/api/chat-dwani", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: "Hello, this is a test message." }],
          language: "en",
          model: "indic-llm",
        }),
      })

      const data = await response.json()
      setConfig((prev) => ({ ...prev, tested: response.ok }))

      if (response.ok) {
        alert("✅ Dwani API connection successful!")
      } else {
        alert(`❌ Connection failed: ${data.error}`)
      }
    } catch (error) {
      alert(`❌ Connection failed: ${error.message}`)
      setConfig((prev) => ({ ...prev, tested: false }))
    } finally {
      setIsChecking(false)
    }
  }

  const copyEnvTemplate = () => {
    const envTemplate = `# Dwani API Configuration
DWANI_API_KEY=your_dwani_api_key_here
DWANI_API_BASE_URL=https://api.dwani.ai/v1

# OpenAI API (fallback)
OPENAI_API_KEY=your_openai_api_key_here`

    navigator.clipboard.writeText(envTemplate)
    alert("📋 Environment variables template copied to clipboard!")
  }

  return (
    <Card className="w-full max-w-2xl border-orange-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Dwani API Setup
          {config.configured ? (
            <Badge className="bg-green-100 text-green-800">Configured</Badge>
          ) : (
            <Badge className="bg-red-100 text-red-800">Not Configured</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Configuration Status */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            {config.configured ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : (
              <XCircle className="w-4 h-4 text-red-500" />
            )}
            <span className="text-sm">API Key</span>
          </div>
          <div className="flex items-center gap-2">
            {config.configured ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : (
              <XCircle className="w-4 h-4 text-red-500" />
            )}
            <span className="text-sm">Base URL</span>
          </div>
        </div>

        {/* Current Configuration */}
        {config.configured && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Current Endpoint:</Label>
            <div className="bg-gray-50 p-2 rounded text-sm font-mono break-all">{config.baseUrl}</div>
          </div>
        )}

        {/* Setup Instructions */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Setup Instructions:</h3>

          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <span className="bg-orange-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                1
              </span>
              <div>
                <p className="font-medium">Get your Dwani API credentials</p>
                <p className="text-gray-600">Contact the organizers for your API key and base URL</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <span className="bg-orange-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                2
              </span>
              <div>
                <p className="font-medium">Set environment variables</p>
                <p className="text-gray-600">Add the following to your .env.local file:</p>
                <div className="mt-2">
                  <Button variant="outline" size="sm" onClick={copyEnvTemplate} className="text-xs">
                    <Copy className="w-3 h-3 mr-1" />
                    Copy Template
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <span className="bg-orange-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                3
              </span>
              <div>
                <p className="font-medium">Restart your development server</p>
                <p className="text-gray-600">
                  Run <code className="bg-gray-100 px-1 rounded">npm run dev</code> again
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <span className="bg-orange-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                4
              </span>
              <div>
                <p className="font-medium">Test the connection</p>
                <p className="text-gray-600">Use the test button below to verify everything works</p>
              </div>
            </div>
          </div>
        </div>

        {/* Repository Information */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium">About Dwani LLM Server:</h3>
          <DwaniRepositoryInfo />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button onClick={checkConfiguration} variant="outline" disabled={isChecking} className="flex-1">
            {isChecking ? "Checking..." : "Check Config"}
          </Button>

          <Button
            onClick={testConnection}
            disabled={!config.configured || isChecking}
            className="flex-1 bg-orange-500 hover:bg-orange-600"
          >
            {isChecking ? "Testing..." : "Test Connection"}
          </Button>
        </div>

        {/* Environment Variables Template */}
        <div className="bg-gray-900 text-green-400 p-3 rounded-md font-mono text-xs overflow-x-auto">
          <div className="text-gray-500 mb-2"># Add to your .env.local file:</div>
          <div>DWANI_API_KEY=your_dwani_api_key_here</div>
          <div>DWANI_API_BASE_URL=https://your-dwani-server.com/api</div>
          <div className="text-gray-500 mt-2"># OpenAI fallback:</div>
          <div>OPENAI_API_KEY=your_openai_api_key_here</div>
          <div className="text-gray-500 mt-2"># Note: Replace with actual Dwani server URL</div>
        </div>

        {/* Python Command Reference */}
        <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
          <strong>Python equivalent (from organizers' demo):</strong>
          <br />
          <code>python src/chat-dwani.py --question "Your question" --lang en --model indic-llm</code>
        </div>
      </CardContent>
    </Card>
  )
}
