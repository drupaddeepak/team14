"use client"

import type React from "react"

import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { Upload } from "lucide-react"

interface FileUploadProps {
  onFileUpload: (file: File) => void
  size?: "default" | "sm"
}

export function FileUpload({ onFileUpload, size = "default" }: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type === "application/pdf") {
      onFileUpload(file)
    } else {
      alert("Please select a PDF file")
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <>
      <input ref={fileInputRef} type="file" accept=".pdf" onChange={handleFileChange} className="hidden" />
      <Button
        type="button"
        variant="outline"
        size={size}
        onClick={handleClick}
        className={`${
          size === "sm"
            ? "h-8 w-8 p-0 text-orange-600 hover:bg-orange-50"
            : "border-orange-300 text-orange-700 hover:bg-orange-50"
        }`}
      >
        <Upload className={`${size === "sm" ? "w-4 h-4" : "w-4 h-4 mr-2"}`} />
        {size !== "sm" && "Upload PDF"}
      </Button>
    </>
  )
}
