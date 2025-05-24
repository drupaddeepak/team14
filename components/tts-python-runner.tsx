"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Play, Download, Code, Terminal } from "lucide-react"

interface PythonTTSRunnerProps {
  language: string
}

export function PythonTTSRunner({ language }: PythonTTSRunnerProps) {
  const [testText, setTestText] = useState("")
  const [selectedSpeaker, setSelectedSpeaker] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [showCommand, setShowCommand] = useState(false)

  const generatePythonCommand = () => {
    const escapedText = testText.replace(/"/g, '\\"')
    return `python src/text-to-speech-dwani.py --text "${escapedText}" --lang ${language} --speaker ${selectedSpeaker || "default"} --output output.wav`
  }

  const testDwhaniTTS = async () => {
    if (!testText.trim()) return

    setIsGenerating(true)
    try {
      const response = await fetch("/api/text-to-speech", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: testText,
          language: language,
          speaker_id: selectedSpeaker,
        }),
      })

      if (response.ok) {
        const audioBlob = await response.blob()
        const url = URL.createObjectURL(audioBlob)
        setAudioUrl(url)

        // Auto-play the generated audio
        const audio = new Audio(url)
        audio.play()
      } else {
        const error = await response.json()
        console.error("TTS Error:", error)
        alert(`TTS Error: ${error.error}`)
      }
    } catch (error) {
      console.error("TTS Generation failed:", error)
      alert("TTS Generation failed. Please check the console for details.")
    } finally {
      setIsGenerating(false)
    }
  }

  const downloadAudio = () => {
    if (audioUrl) {
      const a = document.createElement("a")
      a.href = audioUrl
      a.download = `sarathi-tts-${language}-${Date.now()}.wav`
      a.click()
    }
  }

  const sampleTexts: Record<string, string> = {
    en: "Hello, I am Sarathi AI, your government assistant. How can I help you today?",
    hi: "नमस्ते, मैं सारथी AI हूं, आपका सरकारी सहायक। आज मैं आपकी कैसे मदद कर सकता हूं?",
    kn: "ನಮಸ್ಕಾರ, ನಾನು ಸಾರಥಿ AI, ನಿಮ್ಮ ಸರ್ಕಾರಿ ಸಹಾಯಕ. ಇಂದು ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು?",
    ta: "வணக்கம், நான் சாரதி AI, உங்கள் அரசாங்க உதவியாளர். இன்று நான் உங்களுக்கு எப்படி உதவ முடியும்?",
    te: "నమస్కారం, నేను సారథి AI, మీ ప్రభుత్వ సహాయకుడు. ఈరోజు నేను మీకు ఎలా సహాయం చేయగలను?",
    bn: "নমস্কার, আমি সারথি AI, আপনার সরকারি সহায়ক। আজ আমি আপনাকে কীভাবে সাহায্য করতে পারি?",
  }

  return (
    <Card className="w-full max-w-2xl border-orange-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Terminal className="w-5 h-5" />
          Dwhani TTS Testing
          <Badge variant="outline" className="ml-auto">
            {language.toUpperCase()}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Sample Text Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setTestText(sampleTexts[language] || sampleTexts.en)}
            className="text-xs"
          >
            Load Sample Text
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowCommand(!showCommand)} className="text-xs">
            <Code className="w-3 h-3 mr-1" />
            {showCommand ? "Hide" : "Show"} Python Command
          </Button>
        </div>

        {/* Python Command Display */}
        {showCommand && (
          <div className="bg-gray-900 text-green-400 p-3 rounded-md font-mono text-sm overflow-x-auto">
            <div className="text-gray-500 mb-1"># Dwhani TTS Python Command:</div>
            <div className="break-all">{generatePythonCommand()}</div>
          </div>
        )}

        {/* Text Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Test Text:</label>
          <Textarea
            value={testText}
            onChange={(e) => setTestText(e.target.value)}
            placeholder={`Enter text in ${language.toUpperCase()} to convert to speech...`}
            className="min-h-[100px] border-orange-300"
          />
        </div>

        {/* Speaker Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Speaker:</label>
          <Select value={selectedSpeaker} onValueChange={setSelectedSpeaker}>
            <SelectTrigger className="border-orange-300">
              <SelectValue placeholder="Select speaker (optional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default Speaker</SelectItem>
              <SelectItem value={`${language}_male`}>Male Voice</SelectItem>
              <SelectItem value={`${language}_female`}>Female Voice</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={testDwhaniTTS}
            disabled={!testText.trim() || isGenerating}
            className="flex-1 bg-orange-500 hover:bg-orange-600"
          >
            <Play className="w-4 h-4 mr-2" />
            {isGenerating ? "Generating..." : "Generate & Play"}
          </Button>

          {audioUrl && (
            <Button onClick={downloadAudio} variant="outline" className="border-orange-300">
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          )}
        </div>

        {/* Audio Player */}
        {audioUrl && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Generated Audio:</label>
            <audio controls className="w-full" src={audioUrl}>
              Your browser does not support the audio element.
            </audio>
          </div>
        )}

        {/* API Status */}
        <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
          <strong>API Endpoint:</strong> /api/text-to-speech
          <br />
          <strong>Method:</strong> POST
          <br />
          <strong>Format:</strong> WAV Audio
        </div>
      </CardContent>
    </Card>
  )
}
