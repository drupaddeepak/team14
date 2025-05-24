"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Volume2, Play, Square } from "lucide-react"

export function TTSTest() {
  const [testText, setTestText] = useState("Hello, I am Sarathi AI. How can I help you today?")
  const [selectedLanguage, setSelectedLanguage] = useState("en")
  const [isSpeaking, setIsSpeaking] = useState(false)

  const languages = [
    { code: "en", name: "English", sample: "Hello, I am Sarathi AI. How can I help you today?" },
    { code: "hi", name: "Hindi", sample: "नमस्ते, मैं सारथी AI हूं। आज मैं आपकी कैसे मदद कर सकता हूं?" },
    { code: "kn", name: "Kannada", sample: "ನಮಸ್ಕಾರ, ನಾನು ಸಾರಥಿ AI. ಇಂದು ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು?" },
  ]

  const speak = () => {
    if (!("speechSynthesis" in window)) {
      alert("Speech synthesis not supported in this browser")
      return
    }

    // Stop any ongoing speech
    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(testText)

    const langMap: Record<string, string> = {
      en: "en-US",
      hi: "hi-IN",
      kn: "kn-IN",
    }

    utterance.lang = langMap[selectedLanguage] || "en-US"
    utterance.rate = 1.0
    utterance.pitch = 1.0
    utterance.volume = 1.0

    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = (event) => {
      setIsSpeaking(false)
      console.error("Speech error:", event.error)
      alert(`Speech error: ${event.error}`)
    }

    window.speechSynthesis.speak(utterance)
  }

  const stop = () => {
    window.speechSynthesis.cancel()
    setIsSpeaking(false)
  }

  const loadSample = () => {
    const lang = languages.find((l) => l.code === selectedLanguage)
    if (lang) {
      setTestText(lang.sample)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Volume2 className="w-5 h-5" />
          TTS Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Language:</label>
          <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {languages.map((lang) => (
                <SelectItem key={lang.code} value={lang.code}>
                  {lang.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Text to speak:</label>
          <Textarea
            value={testText}
            onChange={(e) => setTestText(e.target.value)}
            placeholder="Enter text to speak..."
            className="min-h-[100px]"
          />
        </div>

        <div className="flex gap-2">
          <Button onClick={loadSample} variant="outline" size="sm">
            Load Sample
          </Button>
          {!isSpeaking ? (
            <Button onClick={speak} className="flex-1">
              <Play className="w-4 h-4 mr-2" />
              Speak
            </Button>
          ) : (
            <Button onClick={stop} variant="destructive" className="flex-1">
              <Square className="w-4 h-4 mr-2" />
              Stop
            </Button>
          )}
        </div>

        {isSpeaking && <div className="text-center text-sm text-orange-600 animate-pulse">🔊 Speaking...</div>}
      </CardContent>
    </Card>
  )
}
