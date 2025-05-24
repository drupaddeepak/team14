"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Brain, MessageSquare, TestTube, Loader2, Settings } from "lucide-react"
import { DwaniSetup } from "./dwani-setup"

interface DwaniLLMSettingsProps {
  language: string
  onSettingsChange: (settings: DwaniLLMSettings) => void
  isOpen: boolean
  onToggle: () => void
}

export interface DwaniLLMSettings {
  enabled: boolean
  model: string
  temperature: number
  maxTokens: number
  useIndic: boolean
}

export function DwaniLLMSettings({ language, onSettingsChange, isOpen, onToggle }: DwaniLLMSettingsProps) {
  const [settings, setSettings] = useState<DwaniLLMSettings>({
    enabled: false,
    model: "indic-llm",
    temperature: 0.7,
    maxTokens: 1000,
    useIndic: true,
  })
  const [testText, setTestText] = useState("")
  const [testResponse, setTestResponse] = useState("")
  const [isTestingLLM, setIsTestingLLM] = useState(false)
  const [showTesting, setShowTesting] = useState(false)
  const [showSetup, setShowSetup] = useState(false)
  const [isConfigured, setIsConfigured] = useState(false)

  useEffect(() => {
    checkConfiguration()
  }, [])

  const checkConfiguration = async () => {
    try {
      const response = await fetch("/api/chat-dwani")
      const data = await response.json()
      setIsConfigured(data.configured?.apiKey && data.configured?.baseUrl)
    } catch (error) {
      console.error("Failed to check configuration:", error)
      setIsConfigured(false)
    }
  }

  const updateSettings = (newSettings: Partial<DwaniLLMSettings>) => {
    const updated = { ...settings, ...newSettings }
    setSettings(updated)
    onSettingsChange(updated)
  }

  const testDwaniLLM = async () => {
    if (!testText.trim()) return

    setIsTestingLLM(true)
    setTestResponse("")

    try {
      console.log("Testing Dwani LLM with:", { text: testText, language, model: settings.model })

      const response = await fetch("/api/chat-dwani", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: testText }],
          language: language,
          model: settings.model,
        }),
      })

      const data = await response.json()
      console.log("Dwani API response:", data)

      if (response.ok) {
        setTestResponse(data.message || "No response received")

        // Show additional info if available
        if (data.source) {
          setTestResponse((prev) => prev + `\n\n[Source: ${data.source}]`)
        }
      } else {
        setTestResponse(`Error (${response.status}): ${data.error || "Unknown error"}`)

        if (data.details) {
          setTestResponse((prev) => prev + `\nDetails: ${data.details}`)
        }
      }
    } catch (error) {
      console.error("Dwani LLM test failed:", error)
      setTestResponse(
        `Network Error: ${error.message}\n\nThis might indicate:\n1. API endpoint is incorrect\n2. API key is invalid\n3. Network connectivity issues\n4. CORS policy restrictions`,
      )
    } finally {
      setIsTestingLLM(false)
    }
  }

  const sampleQuestions: Record<string, string> = {
    en: "How do I apply for a passport in India?",
    hi: "भारत में पासपोर्ट के लिए आवेदन कैसे करें?",
    kn: "ಭಾರತದಲ್ಲಿ ಪಾಸ್‌ಪೋರ್ಟ್‌ಗಾಗಿ ಹೇಗೆ ಅರ್ಜಿ ಸಲ್ಲಿಸುವುದು?",
    ta: "இந்தியாவில் பாஸ்போர்ட்டுக்கு எப்படி விண்ணப்பிப்பது?",
    te: "భారతదేశంలో పాస్‌పోర్ట్ కోసం ఎలా దరఖాస్తు చేయాలి?",
    bn: "ভারতে পাসপোর্টের জন্য কীভাবে আবেদন করব?",
  }

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={onToggle}
        className="border-orange-300 text-orange-700 hover:bg-orange-50"
      >
        <Brain className="w-4 h-4" />
      </Button>
    )
  }

  return (
    <div className="space-y-4">
      <Card className="w-80 border-orange-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              Dwani LLM Settings
              <Badge variant="outline">{language.toUpperCase()}</Badge>
            </span>
            <Button variant="ghost" size="sm" onClick={onToggle}>
              ×
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Configuration Status */}
          {!isConfigured && (
            <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-md">
              <div className="flex items-center gap-2 text-yellow-800 text-sm">
                <Settings className="w-4 h-4" />
                <span>Dwani API not configured</span>
              </div>
              <Button variant="outline" size="sm" onClick={() => setShowSetup(!showSetup)} className="mt-2 text-xs">
                Show Setup Instructions
              </Button>
            </div>
          )}

          {/* Enable/Disable Dwani LLM */}
          <div className="flex items-center justify-between">
            <Label htmlFor="dwani-enabled" className="text-sm">
              <Brain className="w-4 h-4 inline mr-2" />
              Use Dwani LLM
            </Label>
            <Switch
              id="dwani-enabled"
              checked={settings.enabled}
              onCheckedChange={(enabled) => updateSettings({ enabled })}
              disabled={!isConfigured}
            />
          </div>

          {settings.enabled && isConfigured && (
            <>
              {/* Model Selection */}
              <div className="space-y-2">
                <Label className="text-sm">Model</Label>
                <Select value={settings.model} onValueChange={(model) => updateSettings({ model })}>
                  <SelectTrigger className="border-orange-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="indic-llm">Indic LLM</SelectItem>
                    <SelectItem value="indic-chat">Indic Chat</SelectItem>
                    <SelectItem value="government-assistant">Government Assistant</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Indic Language Support */}
              <div className="flex items-center justify-between">
                <Label htmlFor="use-indic" className="text-sm">
                  Indic Language Support
                </Label>
                <Switch
                  id="use-indic"
                  checked={settings.useIndic}
                  onCheckedChange={(useIndic) => updateSettings({ useIndic })}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  onClick={() => setShowTesting(!showTesting)}
                  variant="outline"
                  className="flex-1 border-orange-300 text-orange-700 hover:bg-orange-50"
                >
                  <TestTube className="w-4 h-4 mr-2" />
                  Test LLM
                </Button>
              </div>
            </>
          )}

          {/* API Info */}
          <div className="text-xs text-gray-600 bg-orange-50 p-2 rounded border border-orange-200">
            <strong>Dwani LLM API</strong>
            <br />
            Status: {isConfigured ? "Configured" : "Not Configured"}
            <br />
            Model: {settings.model} | Language: {language}
            <br />
            Based on organizers' demo setup
          </div>
        </CardContent>
      </Card>

      {/* Setup Instructions */}
      {showSetup && <DwaniSetup />}

      {/* LLM Testing Panel */}
      {showTesting && isConfigured && (
        <Card className="w-full max-w-2xl border-orange-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Dwani LLM Testing
              <Badge variant="outline" className="ml-auto">
                {language.toUpperCase()}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Sample Question Button */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setTestText(sampleQuestions[language] || sampleQuestions.en)}
                className="text-xs"
              >
                Load Sample Question
              </Button>
            </div>

            {/* Test Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Test Question:</label>
              <Textarea
                value={testText}
                onChange={(e) => setTestText(e.target.value)}
                placeholder={`Ask a government-related question in ${language.toUpperCase()}...`}
                className="min-h-[80px] border-orange-300"
              />
            </div>

            {/* Test Button */}
            <Button
              onClick={testDwaniLLM}
              disabled={!testText.trim() || isTestingLLM}
              className="w-full bg-orange-500 hover:bg-orange-600"
            >
              {isTestingLLM ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Test Dwani LLM
                </>
              )}
            </Button>

            {/* Test Response */}
            {testResponse && (
              <div className="space-y-2">
                <label className="text-sm font-medium">LLM Response:</label>
                <div className="bg-gray-50 p-3 rounded-md border border-orange-200 min-h-[100px] whitespace-pre-wrap text-sm">
                  {testResponse}
                </div>
              </div>
            )}

            {/* API Status */}
            <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
              <strong>API Endpoint:</strong> /api/chat-dwani
              <br />
              <strong>Method:</strong> POST
              <br />
              <strong>Model:</strong> {settings.model}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
