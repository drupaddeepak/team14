"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from "lucide-react"

export function DwaniAPIStatus() {
  const [status, setStatus] = useState<{
    dwani: "checking" | "online" | "offline" | "error"
    openai: "checking" | "online" | "offline" | "error"
    lastChecked: Date | null
  }>({
    dwani: "checking",
    openai: "checking",
    lastChecked: null,
  })

  const checkAPIs = async () => {
    setStatus((prev) => ({ ...prev, dwani: "checking", openai: "checking" }))

    // Check Dwani API
    try {
      const dwaniResponse = await fetch("/api/chat-dwani", {
        method: "GET",
      })
      setStatus((prev) => ({
        ...prev,
        dwani: dwaniResponse.ok ? "online" : "offline",
      }))
    } catch (error) {
      setStatus((prev) => ({ ...prev, dwani: "error" }))
    }

    // Check OpenAI API (fallback)
    try {
      const openaiResponse = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: "test" }],
        }),
      })
      setStatus((prev) => ({
        ...prev,
        openai: openaiResponse.ok ? "online" : "offline",
        lastChecked: new Date(),
      }))
    } catch (error) {
      setStatus((prev) => ({
        ...prev,
        openai: "error",
        lastChecked: new Date(),
      }))
    }
  }

  useEffect(() => {
    checkAPIs()
  }, [])

  const getStatusIcon = (apiStatus: string) => {
    switch (apiStatus) {
      case "online":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "offline":
        return <XCircle className="w-4 h-4 text-red-500" />
      case "error":
        return <AlertCircle className="w-4 h-4 text-yellow-500" />
      default:
        return <RefreshCw className="w-4 h-4 text-gray-500 animate-spin" />
    }
  }

  const getStatusBadge = (apiStatus: string) => {
    switch (apiStatus) {
      case "online":
        return <Badge className="bg-green-100 text-green-800">Online</Badge>
      case "offline":
        return <Badge className="bg-red-100 text-red-800">Offline</Badge>
      case "error":
        return <Badge className="bg-yellow-100 text-yellow-800">Error</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">Checking...</Badge>
    }
  }

  return (
    <Card className="w-full max-w-md border-orange-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center justify-between">
          API Status
          <Button variant="ghost" size="sm" onClick={checkAPIs} className="h-6 w-6 p-0">
            <RefreshCw className="w-3 h-3" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon(status.dwani)}
            <span className="text-sm">Dwani LLM</span>
          </div>
          {getStatusBadge(status.dwani)}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon(status.openai)}
            <span className="text-sm">OpenAI (Fallback)</span>
          </div>
          {getStatusBadge(status.openai)}
        </div>

        {status.lastChecked && (
          <div className="text-xs text-gray-500 text-center pt-2 border-t">
            Last checked: {status.lastChecked.toLocaleTimeString()}
          </div>
        )}

        <div className="text-xs text-orange-700 bg-orange-50 p-2 rounded">
          <strong>Note:</strong> If Dwani API fails, the system automatically falls back to OpenAI.
        </div>
      </CardContent>
    </Card>
  )
}
