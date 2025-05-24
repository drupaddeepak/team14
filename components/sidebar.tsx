"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Home, User, Globe, Plus, MessageSquare, X, Bot } from "lucide-react"
import { useState } from "react"

interface ChatSession {
  id: string
  title: string
  messages: any[]
  createdAt: Date
}

interface SidebarProps {
  currentLanguage: string
  onLanguageChange: (lang: string) => void
  chatSessions: ChatSession[]
  activeChatId: string | null
  onNewChat: () => void
  onSwitchChat: (chatId: string) => void
  onDeleteChat: (chatId: string) => void
}

const languages = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "hi", name: "Hindi", nativeName: "हिंदी" },
  { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ" },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்" },
  { code: "te", name: "Telugu", nativeName: "తెలుగు" },
  { code: "bn", name: "Bengali", nativeName: "বাংলা" },
  { code: "gu", name: "Gujarati", nativeName: "ગુજરાતી" },
  { code: "mr", name: "Marathi", nativeName: "मराठी" },
  { code: "pa", name: "Punjabi", nativeName: "ਪੰਜਾਬੀ" },
  { code: "or", name: "Odia", nativeName: "ଓଡ଼ିଆ" },
]

export function Sidebar({
  currentLanguage,
  onLanguageChange,
  chatSessions,
  activeChatId,
  onNewChat,
  onSwitchChat,
  onDeleteChat,
}: SidebarProps) {
  const [hoveredChatId, setHoveredChatId] = useState<string | null>(null)

  const menuItems = [
    {
      icon: Home,
      label: currentLanguage === "hi" ? "होम (चैट)" : currentLanguage === "kn" ? "ಮನೆ (ಚಾಟ್)" : "Home (Chat)",
      active: true,
    },
  ]

  const formatDate = (date: Date) => {
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return currentLanguage === "hi" ? "आज" : currentLanguage === "kn" ? "ಇಂದು" : "Today"
    } else if (diffInHours < 48) {
      return currentLanguage === "hi" ? "कल" : currentLanguage === "kn" ? "ನಿನ್ನೆ" : "Yesterday"
    } else {
      return date.toLocaleDateString()
    }
  }

  const getNewChatText = () => {
    switch (currentLanguage) {
      case "hi":
        return "नई चैट"
      case "kn":
        return "ಹೊಸ ಚಾಟ್"
      case "ta":
        return "புதிய அரட்டை"
      case "te":
        return "కొత్త చాట్"
      case "bn":
        return "নতুন চ্যাট"
      default:
        return "New Chat"
    }
  }

  const getChatsText = () => {
    switch (currentLanguage) {
      case "hi":
        return "चैट्स"
      case "kn":
        return "ಚಾಟ್‌ಗಳು"
      case "ta":
        return "அரட்டைகள்"
      case "te":
        return "చాట్‌లు"
      case "bn":
        return "চ্যাটসমূহ"
      default:
        return "Chats"
    }
  }

  const getLanguageText = () => {
    switch (currentLanguage) {
      case "hi":
        return "भाषा"
      case "kn":
        return "ಭಾಷೆ"
      case "ta":
        return "மொழி"
      case "te":
        return "భాష"
      case "bn":
        return "ভাষা"
      default:
        return "Language"
    }
  }

  const handleDeleteChat = (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation()
    onDeleteChat(chatId)
  }

  return (
    <div className="w-80 bg-white border-r border-orange-200 flex flex-col">
      {/* Logo */}
      <div className="p-4 border-b border-orange-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-orange-900">Sarathi AI</span>
        </div>
      </div>

      {/* New Chat Button */}
      <div className="p-4">
        <Button onClick={onNewChat} className="w-full bg-orange-500 hover:bg-orange-600 text-white">
          <Plus className="w-4 h-4 mr-2" />
          {getNewChatText()}
        </Button>
      </div>

      {/* Navigation */}
      <div className="px-4">
        <nav className="space-y-2">
          {menuItems.map((item, index) => (
            <Button
              key={index}
              variant={item.active ? "default" : "ghost"}
              className={`w-full justify-start ${
                item.active ? "bg-orange-500 text-white hover:bg-orange-600" : "text-orange-700 hover:bg-orange-50"
              }`}
            >
              <item.icon className="w-4 h-4 mr-3" />
              {item.label}
            </Button>
          ))}
        </nav>
      </div>

      <Separator className="mx-4 my-4 bg-orange-200" />

      {/* Chat History */}
      <div className="flex-1 px-4">
        <h3 className="text-sm font-medium text-orange-900 mb-3">{getChatsText()}</h3>
        <ScrollArea className="h-full">
          <div className="space-y-2">
            {chatSessions.map((chat) => (
              <div
                key={chat.id}
                className="relative group"
                onMouseEnter={() => setHoveredChatId(chat.id)}
                onMouseLeave={() => setHoveredChatId(null)}
              >
                <Button
                  variant={activeChatId === chat.id ? "secondary" : "ghost"}
                  onClick={() => onSwitchChat(chat.id)}
                  className={`w-full justify-start text-left h-auto p-3 pr-8 ${
                    activeChatId === chat.id
                      ? "bg-orange-100 text-orange-900 border border-orange-200"
                      : "text-orange-700 hover:bg-orange-50"
                  }`}
                >
                  <div className="flex items-start gap-2 w-full">
                    <MessageSquare className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{chat.title}</div>
                      <div className="text-xs text-orange-600 mt-1">{formatDate(chat.createdAt)}</div>
                    </div>
                  </div>
                </Button>

                {/* Delete Button */}
                {hoveredChatId === chat.id && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => handleDeleteChat(e, chat.id)}
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0 text-orange-600 hover:bg-orange-100 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                )}
              </div>
            ))}
            {chatSessions.length === 0 && (
              <div className="text-center text-orange-600 text-sm py-8">
                {currentLanguage === "hi"
                  ? "कोई चैट नहीं मिली"
                  : currentLanguage === "kn"
                    ? "ಯಾವುದೇ ಚಾಟ್ ಕಂಡುಬಂದಿಲ್ಲ"
                    : "No chats found"}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      <Separator className="mx-4 my-4 bg-orange-200" />

      {/* Language Selector */}
      <div className="px-4 pb-4">
        <p className="text-sm font-medium text-orange-900 mb-2">{getLanguageText()}</p>
        <Select value={currentLanguage} onValueChange={onLanguageChange}>
          <SelectTrigger className="w-full border-orange-300 text-orange-700">
            <SelectValue>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                {languages.find((lang) => lang.code === currentLanguage)?.nativeName}
              </div>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {languages.map((language) => (
              <SelectItem key={language.code} value={language.code}>
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  <span>{language.nativeName}</span>
                  <span className="text-sm text-gray-500">({language.name})</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* User Section */}
      <div className="p-4 border-t border-orange-200">
        <Button variant="ghost" className="w-full justify-start text-orange-700 hover:bg-orange-50">
          <User className="w-4 h-4 mr-3" />
          {currentLanguage === "hi" ? "लॉगिन" : currentLanguage === "kn" ? "ಲಾಗಿನ್" : "Login"}
        </Button>
      </div>
    </div>
  )
}
