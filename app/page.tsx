"use client"

import { useState, useEffect } from "react"
import { useChat } from "ai/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Mic, Send, Bot, Volume2, VolumeX, Brain } from "lucide-react"
import { Sidebar } from "@/components/sidebar"
import { ChatMessage } from "@/components/chat-message"
import { FileUpload } from "@/components/file-upload"
import { TTSSettings, type TTSSettings as TTSSettingsType } from "@/components/tts-settings"
import { DwaniLLMSettings, type DwaniLLMSettings as DwaniLLMSettingsType } from "@/components/dwani-llm-settings"
import { sendChatMessage } from "@/lib/api-client"

interface ChatSession {
  id: string
  title: string
  messages: any[]
  createdAt: Date
}

export default function SarathiAI() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isListening, setIsListening] = useState(false)
  const [currentLanguage, setCurrentLanguage] = useState("en")
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([])
  const [activeChatId, setActiveChatId] = useState<string | null>(null)
  const [ttsSettings, setTtsSettings] = useState<TTSSettingsType>({
    enabled: true,
    speed: 1.0,
    pitch: 1.0,
    speaker_id: "english_female",
    autoPlay: true,
  })
  const [showTTSSettings, setShowTTSSettings] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [dwaniLLMSettings, setDwaniLLMSettings] = useState<DwaniLLMSettingsType>({
    enabled: false,
    model: "indic-llm",
    temperature: 0.7,
    maxTokens: 1000,
    useIndic: true,
  })
  const [showDwaniLLMSettings, setShowDwaniLLMSettings] = useState(false)

  // Initialize speech synthesis voices
  useEffect(() => {
    if ("speechSynthesis" in window) {
      // Load voices
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices()
        console.log("Available voices:", voices.length)
      }

      loadVoices()
      window.speechSynthesis.onvoiceschanged = loadVoices
    }
  }, [])

  const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages } = useChat({
    api: "http://localhost:5000/api/chat",
    body: {
      language: currentLanguage,
      model: dwaniLLMSettings.model,
    },
    onFinish: (message) => {
      console.log("Chat response received:", message);
      // Convert response to speech
      if (ttsSettings.enabled && ttsSettings.autoPlay) {
        console.log("TTS enabled, converting to speech:", message.content);
        handleTextToSpeech(message.content)
      }
      // Update chat session
      console.log("Updating chat session with message:", message);
      updateChatSession(message)
    },
  })

  // Add debug log for messages array
  useEffect(() => {
    console.log("Messages array updated:", messages);
  }, [messages]);

  const createNewChat = () => {
    const newChatId = `chat-${Date.now()}`
    const newChat: ChatSession = {
      id: newChatId,
      title: currentLanguage === "hi" ? "नई चैट" : currentLanguage === "kn" ? "ಹೊಸ ಚಾಟ್" : "New Chat",
      messages: [],
      createdAt: new Date(),
    }

    setChatSessions((prev) => [newChat, ...prev])
    setActiveChatId(newChatId)
    setMessages([])
    setSelectedFile(null)
  }

  const switchToChat = (chatId: string) => {
    const chat = chatSessions.find((c) => c.id === chatId)
    if (chat) {
      setActiveChatId(chatId)
      setMessages(chat.messages)
    }
  }

  const updateChatSession = (newMessage: any) => {
    if (activeChatId) {
      setChatSessions((prev) =>
        prev.map((chat) =>
          chat.id === activeChatId
            ? {
                ...chat,
                messages: [...messages, newMessage],
                title:
                  chat.title === (currentLanguage === "hi" ? "नई चैट" : currentLanguage === "kn" ? "ಹೊಸ ಚಾಟ್" : "New Chat")
                    ? newMessage.content.slice(0, 30) + "..."
                    : chat.title,
              }
            : chat,
        ),
      )
    }
  }

  const deleteChat = (chatId: string) => {
    setChatSessions((prev) => prev.filter((chat) => chat.id !== chatId))

    if (activeChatId === chatId) {
      const remainingChats = chatSessions.filter((chat) => chat.id !== chatId)
      if (remainingChats.length > 0) {
        setActiveChatId(remainingChats[0].id)
        setMessages(remainingChats[0].messages)
      } else {
        setActiveChatId(null)
        setMessages([])
      }
    }
  }

  const handleTextToSpeech = async (text: string) => {
    if (!ttsSettings.enabled || !text.trim()) return

    console.log("TTS: Starting speech for:", text.substring(0, 50))

    // Stop any ongoing speech
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel()
    }

    try {
      // Use browser TTS directly for reliability
      speakWithBrowserTTS(text)
    } catch (error) {
      console.error("TTS error:", error)
    }
  }

  const speakWithBrowserTTS = (text: string) => {
    if (!("speechSynthesis" in window)) {
      console.error("Speech synthesis not supported")
      return
    }

    const utterance = new SpeechSynthesisUtterance(text)

    // Language mapping
    const langMap: Record<string, string> = {
      en: "en-US",
      hi: "hi-IN",
      kn: "kn-IN",
      ta: "ta-IN",
      te: "te-IN",
      bn: "bn-IN",
      gu: "gu-IN",
      mr: "mr-IN",
      pa: "pa-IN",
      or: "or-IN",
    }

    utterance.lang = langMap[currentLanguage] || "en-US"
    utterance.rate = ttsSettings.speed
    utterance.pitch = ttsSettings.pitch
    utterance.volume = 1.0

    // Find the best voice for the language
    const voices = window.speechSynthesis.getVoices()
    const targetLang = langMap[currentLanguage] || "en-US"

    // Try to find exact language match
    let selectedVoice = voices.find((voice) => voice.lang === targetLang)

    // Fallback to language prefix match (e.g., "hi" matches "hi-IN")
    if (!selectedVoice) {
      const langPrefix = targetLang.split("-")[0]
      selectedVoice = voices.find((voice) => voice.lang.startsWith(langPrefix))
    }

    // Final fallback to English
    if (!selectedVoice) {
      selectedVoice = voices.find((voice) => voice.lang.startsWith("en"))
    }

    if (selectedVoice) {
      utterance.voice = selectedVoice
      console.log("Using voice:", selectedVoice.name, selectedVoice.lang)
    }

    utterance.onstart = () => {
      setIsSpeaking(true)
      console.log("TTS: Speech started")
    }

    utterance.onend = () => {
      setIsSpeaking(false)
      console.log("TTS: Speech ended")
    }

    utterance.onerror = (event) => {
      setIsSpeaking(false)
      console.error("TTS error:", event.error)
    }

    // Speak the text
    window.speechSynthesis.speak(utterance)
  }

  const stopSpeech = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
    }
  }

  const handleFileUpload = async (file: File) => {
    setSelectedFile(file)

    const formData = new FormData()
    formData.append("file", file)

    try {
      const response = await fetch("/api/process-pdf", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      const syntheticEvent = {
        preventDefault: () => {},
        target: {
          value: `I've uploaded a government form: ${file.name}. Please analyze it and guide me on how to fill it out.`,
        },
      } as any

      handleInputChange(syntheticEvent)
      handleSubmit(syntheticEvent)
    } catch (error) {
      console.error("PDF processing error:", error)
    }
  }

  const startVoiceRecognition = () => {
    if ("webkitSpeechRecognition" in window) {
      const recognition = new (window as any).webkitSpeechRecognition()
      recognition.lang = currentLanguage === "hi" ? "hi-IN" : currentLanguage === "kn" ? "kn-IN" : "en-US"
      recognition.onstart = () => setIsListening(true)
      recognition.onend = () => setIsListening(false)
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        const syntheticEvent = {
          preventDefault: () => {},
          target: { value: transcript },
        } as any
        handleInputChange(syntheticEvent)
      }
      recognition.start()
    }
  }

  const getWelcomeMessage = () => {
    switch (currentLanguage) {
      case "hi":
        return {
          title: "नमस्ते! मैं सारथी AI हूं",
          description:
            "मैं आपका सरकारी सहायक हूं। आप कोई भी सरकारी फॉर्म का PDF अपलोड कर सकते हैं और मैं आपको बताऊंगा कि इसे कैसे भरना है। मैं आवाज में भी जवाब दे सकता हूं।",
        }
      case "kn":
        return {
          title: "ನಮಸ್ಕಾರ! ನಾನು ಸಾರಥಿ AI",
          description:
            "ನಾನು ನಿಮ್ಮ ಸರ್ಕಾರಿ ಸಹಾಯಕ. ನೀವು ಯಾವುದೇ ಸರ್ಕಾರಿ ಫಾರ್ಮ್ PDF ಅಪ್‌ಲೋಡ್ ಮಾಡಬಹುದು ಮತ್ತು ಅದನ್ನು ಹೇಗೆ ಭರ್ತಿ ಮಾಡಬೇಕೆಂದು ನಾನು ನಿಮಗೆ ಮಾರ್ಗದರ್ಶನ ನೀಡುತ್ತೇನೆ.",
        }
      case "ta":
        return {
          title: "வணக்கம்! நான் சாரதி AI",
          description:
            "நான் உங்கள் அரசாங்க உதவியாளர். நீங்கள் எந்த அரசாங்க படிவத்தின் PDF ஐ பதிவேற்றலாம், அதை எப்படி நிரப்புவது என்று நான் உங்களுக்கு வழிகாட்டுவேன்.",
        }
      case "te":
        return {
          title: "నమస్కారం! నేను సారథి AI",
          description:
            "నేను మీ ప్రభుత్వ సహాయకుడిని. మీరు ఏదైనా ప్రభుత్వ ఫారమ్ PDF ను అప్‌లోడ్ చేయవచ్చు మరియు దానిని ఎలా పూరించాలో నేను మీకు మార్గదర్శనం చేస్తాను.",
        }
      case "bn":
        return {
          title: "নমস্কার! আমি সারথি AI",
          description:
            "আমি আপনার সরকারি সহায়ক। আপনি যেকোনো সরকারি ফর্মের PDF আপলোড করতে পারেন এবং কীভাবে তা পূরণ করতে হবে তা আমি আপনাকে গাইড করব।",
        }
      default:
        return {
          title: "Namaste! I am Sarathi AI",
          description:
            "I am your government assistant. You can upload any government form PDF and I will guide you on how to fill it out. I can also provide voice responses.",
        }
    }
  }

  // Add debug log in the render section
  console.log("Rendering messages:", messages);

  return (
    <div className="flex h-screen bg-orange-50">
      <Sidebar
        currentLanguage={currentLanguage}
        onLanguageChange={setCurrentLanguage}
        chatSessions={chatSessions}
        activeChatId={activeChatId}
        onNewChat={createNewChat}
        onSwitchChat={switchToChat}
        onDeleteChat={deleteChat}
      />

      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-orange-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-orange-900">Sarathi AI</h1>
              <p className="text-sm text-orange-600">
                {currentLanguage === "hi"
                  ? "आपका सरकारी सहायक - सरकारी फॉर्म भरने में मदद"
                  : currentLanguage === "kn"
                    ? "ನಿಮ್ಮ ಸರ್ಕಾರಿ ಸಹಾಯಕ - ಸರ್ಕಾರಿ ಫಾರ್ಮ್‌ಗಳನ್ನು ಭರ್ತಿ ಮಾಡಲು ಸಹಾಯ"
                    : currentLanguage === "ta"
                      ? "உங்கள் அரசாங்க உதவியாளர் - அரசாங்க படிவங்களை நிரப்ப உதவி"
                      : currentLanguage === "te"
                        ? "సారథి AI ని అడగండి..."
                        : currentLanguage === "bn"
                          ? "সারথি AI কে জিজ্ঞাসা করুন..."
                          : "Your Government Assistant - Help with Government Forms"}
              </p>
            </div>
            {/* TTS Status Indicator */}
            {isSpeaking && (
              <div className="flex items-center gap-2">
                <Volume2 className="w-5 h-5 text-orange-500 animate-pulse" />
                <Button
                  onClick={stopSpeech}
                  size="sm"
                  variant="outline"
                  className="border-orange-300 text-orange-700 hover:bg-orange-50"
                >
                  <VolumeX className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <ScrollArea className="flex-1 p-4">
          <div className="max-w-4xl mx-auto space-y-4">
            {messages.length === 0 && (
              <Card className="bg-gradient-to-r from-orange-100 to-orange-50 border-orange-200">
                <CardContent className="p-6">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto">
                      <Bot className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-orange-900">{getWelcomeMessage().title}</h2>
                    <p className="text-orange-700 max-w-2xl mx-auto">{getWelcomeMessage().description}</p>
                    <div className="flex justify-center gap-4 mt-6">
                      <FileUpload onFileUpload={handleFileUpload} />
                      <Button
                        variant="outline"
                        onClick={startVoiceRecognition}
                        disabled={isListening}
                        className="border-orange-300 text-orange-700 hover:bg-orange-50"
                      >
                        <Mic className={`w-4 h-4 mr-2 ${isListening ? "animate-pulse" : ""}`} />
                        {isListening
                          ? currentLanguage === "hi"
                            ? "सुन रहा हूं..."
                            : currentLanguage === "kn"
                              ? "ಕೇಳುತ್ತಿದ್ದೇನೆ..."
                              : "Listening..."
                          : currentLanguage === "hi"
                            ? "बोलें"
                            : currentLanguage === "kn"
                              ? "ಮಾತನಾಡಿ"
                              : "Speak"}
                      </Button>
                      {/* Test TTS Button */}
                      <Button
                        variant="outline"
                        onClick={() => handleTextToSpeech(getWelcomeMessage().title)}
                        className="border-orange-300 text-orange-700 hover:bg-orange-50"
                      >
                        <Volume2 className="w-4 h-4 mr-2" />
                        Test Voice
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                onPlayAudio={handleTextToSpeech}
                language={currentLanguage}
              />
            ))}

            {isLoading && (
              <Card className="bg-white border-orange-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" />
                      <div
                        className="w-2 h-2 bg-orange-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      />
                      <div
                        className="w-2 h-2 bg-orange-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t border-orange-200 bg-white p-4">
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <div className="flex-1 relative">
                <Input
                  value={input}
                  onChange={handleInputChange}
                  placeholder={
                    currentLanguage === "hi"
                      ? "सारथी AI से पूछें..."
                      : currentLanguage === "kn"
                        ? "ಸಾರಥಿ AI ಯಿಂದ ಕೇಳಿ..."
                        : currentLanguage === "ta"
                          ? "சாரதி AI யிடம் கேளுங்கள்..."
                          : currentLanguage === "te"
                            ? "సారథి AI ని అడగండి..."
                            : currentLanguage === "bn"
                              ? "সারথি AI কে জিজ্ঞাসা করুন..."
                              : "Ask Sarathi AI..."
                  }
                  className="pr-20 border-orange-300 focus:border-orange-500"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={startVoiceRecognition}
                    disabled={isListening}
                    className="h-8 w-8 p-0 text-orange-600 hover:bg-orange-50"
                  >
                    <Mic className={`w-4 h-4 ${isListening ? "animate-pulse" : ""}`} />
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowTTSSettings(!showTTSSettings)}
                    className="h-8 w-8 p-0 text-orange-600 hover:bg-orange-50"
                  >
                    <Volume2 className="w-4 h-4" />
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowDwaniLLMSettings(!showDwaniLLMSettings)}
                    className="h-8 w-8 p-0 text-orange-600 hover:bg-orange-50"
                  >
                    <Brain className="w-4 h-4" />
                  </Button>
                  <FileUpload onFileUpload={handleFileUpload} size="sm" />
                </div>
              </div>
              <Button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>

            {/* TTS Settings */}
            {showTTSSettings && (
              <div className="absolute bottom-20 right-4 z-10">
                <TTSSettings
                  language={currentLanguage}
                  onSettingsChange={setTtsSettings}
                  isOpen={showTTSSettings}
                  onToggle={() => setShowTTSSettings(false)}
                />
              </div>
            )}
            {/* Dwani LLM Settings */}
            {showDwaniLLMSettings && (
              <div className="absolute bottom-20 left-4 z-10">
                <DwaniLLMSettings
                  language={currentLanguage}
                  onSettingsChange={setDwaniLLMSettings}
                  isOpen={showDwaniLLMSettings}
                  onToggle={() => setShowDwaniLLMSettings(false)}
                />
              </div>
            )}
            {selectedFile && <div className="mt-2 text-sm text-orange-600">📄 {selectedFile.name} uploaded</div>}
          </div>
        </div>
      </div>
    </div>
  )
}
