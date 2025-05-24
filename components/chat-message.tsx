"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Volume2, User, Bot } from "lucide-react"
import type { Message } from "ai"

interface ChatMessageProps {
  message: Message
  onPlayAudio: (text: string) => void
  language: string
}

export function ChatMessage({ message, onPlayAudio, language }: ChatMessageProps) {
  const isUser = message.role === "user"

  const getUserLabel = () => {
    switch (language) {
      case "hi":
        return "आप"
      case "kn":
        return "ನೀವು"
      case "ta":
        return "நீங்கள்"
      case "te":
        return "మీరు"
      case "bn":
        return "আপনি"
      default:
        return "You"
    }
  }

  return (
    <Card className={`${isUser ? "ml-12 bg-orange-50 border-orange-200" : "mr-12 bg-white border-gray-200"}`}>
      <CardContent className="p-4">
        <div className="flex gap-3">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              isUser ? "bg-orange-500" : "bg-gradient-to-br from-orange-500 to-orange-600"
            }`}
          >
            {isUser ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">{isUser ? getUserLabel() : "Sarathi AI"}</span>
              {!isUser && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onPlayAudio(message.content)}
                  className="h-6 w-6 p-0 text-orange-600 hover:bg-orange-50"
                >
                  <Volume2 className="w-3 h-3" />
                </Button>
              )}
            </div>
            <div className="prose prose-sm max-w-none">
              <p className="text-gray-800 whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
