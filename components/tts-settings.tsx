"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Volume2, Settings, VolumeX, TestTube } from "lucide-react"
import { PythonTTSRunner } from "./tts-python-runner"

interface TTSSettingsProps {
  language: string
  onSettingsChange: (settings: TTSSettings) => void
  isOpen: boolean
  onToggle: () => void
}

export interface TTSSettings {
  enabled: boolean
  speed: number
  pitch: number
  speaker_id: string
  autoPlay: boolean
}

interface Speaker {
  id: string
  name: string
  gender: string
}

export function TTSSettings({ language, onSettingsChange, isOpen, onToggle }: TTSSettingsProps) {
  const [settings, setSettings] = useState<TTSSettings>({
    enabled: true,
    speed: 1.0,
    pitch: 1.0,
    speaker_id: `${language}_female`,
    autoPlay: true,
  })
  const [availableSpeakers, setAvailableSpeakers] = useState<Speaker[]>([])
  const [showTesting, setShowTesting] = useState(false)

  // Fetch available speakers for the current language
  useEffect(() => {
    fetchSpeakers()
  }, [language])

  const fetchSpeakers = async () => {
    try {
      const response = await fetch(`/api/text-to-speech?language=${language}`)
      if (response.ok) {
        const data = await response.json()
        setAvailableSpeakers(data.speakers || [])
      }
    } catch (error) {
      console.error("Failed to fetch speakers:", error)
      // Fallback speakers
      setAvailableSpeakers([
        { id: `${language}_male`, name: `${language.toUpperCase()} Male`, gender: "male" },
        { id: `${language}_female`, name: `${language.toUpperCase()} Female`, gender: "female" },
      ])
    }
  }

  const updateSettings = (newSettings: Partial<TTSSettings>) => {
    const updated = { ...settings, ...newSettings }
    setSettings(updated)
    onSettingsChange(updated)
  }

  const testVoice = async () => {
    const testTexts: Record<string, string> = {
      en: "Hello, this is a voice test.",
      hi: "नमस्ते, यह आवाज़ का परीक्षण है।",
      kn: "ನಮಸ್ಕಾರ, ಇದು ಧ್ವನಿ ಪರೀಕ್ಷೆ.",
      ta: "வணக்கம், இது குரல் சோதனை.",
      te: "నమస్కారం, ఇది వాయిస్ టెస్ట్.",
      bn: "নমস্কার, এটি একটি ভয়েস টেস্ট।",
    }

    const testText = testTexts[language] || testTexts.en

    try {
      const response = await fetch("/api/text-to-speech", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: testText,
          language,
          speaker_id: settings.speaker_id,
          speed: settings.speed,
          pitch: settings.pitch,
        }),
      })

      if (response.ok) {
        const audioBlob = await response.blob()
        const audioUrl = URL.createObjectURL(audioBlob)
        const audio = new Audio(audioUrl)
        audio.play()
      }
    } catch (error) {
      console.error("Voice test failed:", error)
    }
  }

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={onToggle}
        className="border-orange-300 text-orange-700 hover:bg-orange-50"
      >
        <Settings className="w-4 h-4" />
      </Button>
    )
  }

  return (
    <div className="space-y-4">
      <Card className="w-80 border-orange-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center justify-between">
            <span className="flex items-center gap-2">
              Voice Settings
              <Badge variant="outline">{language.toUpperCase()}</Badge>
            </span>
            <Button variant="ghost" size="sm" onClick={onToggle}>
              ×
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Enable/Disable TTS */}
          <div className="flex items-center justify-between">
            <Label htmlFor="tts-enabled" className="text-sm">
              {settings.enabled ? (
                <Volume2 className="w-4 h-4 inline mr-2" />
              ) : (
                <VolumeX className="w-4 h-4 inline mr-2" />
              )}
              Voice Responses
            </Label>
            <Switch
              id="tts-enabled"
              checked={settings.enabled}
              onCheckedChange={(enabled) => updateSettings({ enabled })}
            />
          </div>

          {settings.enabled && (
            <>
              {/* Auto-play */}
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-play" className="text-sm">
                  Auto-play responses
                </Label>
                <Switch
                  id="auto-play"
                  checked={settings.autoPlay}
                  onCheckedChange={(autoPlay) => updateSettings({ autoPlay })}
                />
              </div>

              {/* Speaker Selection */}
              <div className="space-y-2">
                <Label className="text-sm">Dwhani Speaker</Label>
                <Select value={settings.speaker_id} onValueChange={(speaker_id) => updateSettings({ speaker_id })}>
                  <SelectTrigger className="border-orange-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSpeakers.map((speaker) => (
                      <SelectItem key={speaker.id} value={speaker.id}>
                        <div className="flex items-center gap-2">
                          <span>{speaker.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {speaker.gender}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Speed Control */}
              <div className="space-y-2">
                <Label className="text-sm">Speed: {settings.speed.toFixed(1)}x</Label>
                <Slider
                  value={[settings.speed]}
                  onValueChange={([speed]) => updateSettings({ speed })}
                  min={0.5}
                  max={2.0}
                  step={0.1}
                  className="w-full"
                />
              </div>

              {/* Pitch Control */}
              <div className="space-y-2">
                <Label className="text-sm">Pitch: {settings.pitch.toFixed(1)}</Label>
                <Slider
                  value={[settings.pitch]}
                  onValueChange={([pitch]) => updateSettings({ pitch })}
                  min={0.5}
                  max={2.0}
                  step={0.1}
                  className="w-full"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  onClick={testVoice}
                  variant="outline"
                  className="flex-1 border-orange-300 text-orange-700 hover:bg-orange-50"
                >
                  <Volume2 className="w-4 h-4 mr-2" />
                  Test Voice
                </Button>
                <Button
                  onClick={() => setShowTesting(!showTesting)}
                  variant="outline"
                  size="sm"
                  className="border-orange-300 text-orange-700 hover:bg-orange-50"
                >
                  <TestTube className="w-4 h-4" />
                </Button>
              </div>

              {/* API Info */}
              <div className="text-xs text-gray-600 bg-orange-50 p-2 rounded border border-orange-200">
                <strong>Dwhani TTS API</strong>
                <br />
                Language: {language} | Format: WAV
                <br />
                Server: GitHub dwani-ai/tts-indic-server
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Python TTS Testing Panel */}
      {showTesting && <PythonTTSRunner language={language} />}
    </div>
  )
}
