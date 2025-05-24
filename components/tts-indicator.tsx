"use client"

import { Volume2, VolumeX, Loader2 } from "lucide-react"

interface TTSIndicatorProps {
  isEnabled: boolean
  isPlaying: boolean
  isLoading: boolean
}

export function TTSIndicator({ isEnabled, isPlaying, isLoading }: TTSIndicatorProps) {
  if (!isEnabled) {
    return <VolumeX className="w-4 h-4 text-gray-400" />
  }

  if (isLoading) {
    return <Loader2 className="w-4 h-4 text-orange-500 animate-spin" />
  }

  if (isPlaying) {
    return <Volume2 className="w-4 h-4 text-orange-500 animate-pulse" />
  }

  return <Volume2 className="w-4 h-4 text-orange-600" />
}
