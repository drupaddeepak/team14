"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Code, Terminal, Copy } from "lucide-react"

interface DwaniLLMPythonRunnerProps {
  language: string
}

export function DwaniLLMPythonRunner({ language }: DwaniLLMPythonRunnerProps) {
  const [testQuestion, setTestQuestion] = useState("")
  const [selectedModel, setSelectedModel] = useState("indic-llm")
  const [showCommand, setShowCommand] = useState(false)

  const generatePythonCommand = () => {
    const escapedQuestion = testQuestion.replace(/"/g, '\\"')
    return `python src/chat-dwani.py --question "${escapedQuestion}" --lang ${language} --model ${selectedModel} --output response.txt`
  }

  const copyCommand = () => {
    navigator.clipboard.writeText(generatePythonCommand())
  }

  const sampleQuestions: Record<string, string> = {
    en: "What documents do I need to apply for an Aadhaar card?",
    hi: "आधार कार्ड के लिए आवेदन करने के लिए मुझे कौन से दस्तावेज चाहिए?",
    kn: "ಆಧಾರ್ ಕಾರ್ಡ್‌ಗೆ ಅರ್ಜಿ ಸಲ್ಲಿಸಲು ನನಗೆ ಯಾವ ದಾಖಲೆಗಳು ಬೇಕು?",
    ta: "ஆதார் கார்டுக்கு விண்ணப்பிக்க எனக்கு என்ன ஆவணங்கள் தேவை?",
    te: "ఆధార్ కార్డ్ కోసం దరఖాస్తు చేయడానికి నాకు ఏ పత్రాలు అవసరం?",
    bn: "আধার কার্ডের জন্য আবেদন করতে আমার কী কী কাগজপত্র লাগবে?",
  }

  return (
    <Card className="w-full max-w-2xl border-orange-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Terminal className="w-5 h-5" />
          Dwani LLM Python Testing
          <Badge variant="outline" className="ml-auto">
            {language.toUpperCase()}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Sample Question Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setTestQuestion(sampleQuestions[language] || sampleQuestions.en)}
            className="text-xs"
          >
            Load Sample Question
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowCommand(!showCommand)} className="text-xs">
            <Code className="w-3 h-3 mr-1" />
            {showCommand ? "Hide" : "Show"} Python Command
          </Button>
        </div>

        {/* Python Command Display */}
        {showCommand && (
          <div className="bg-gray-900 text-green-400 p-3 rounded-md font-mono text-sm overflow-x-auto">
            <div className="flex items-center justify-between mb-1">
              <div className="text-gray-500"># Dwani LLM Python Command:</div>
              <Button
                variant="ghost"
                size="sm"
                onClick={copyCommand}
                className="h-6 w-6 p-0 text-green-400 hover:bg-gray-800"
              >
                <Copy className="w-3 h-3" />
              </Button>
            </div>
            <div className="break-all">{generatePythonCommand()}</div>
          </div>
        )}

        {/* Question Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Test Question:</label>
          <Textarea
            value={testQuestion}
            onChange={(e) => setTestQuestion(e.target.value)}
            placeholder={`Enter a government-related question in ${language.toUpperCase()}...`}
            className="min-h-[100px] border-orange-300"
          />
        </div>

        {/* Model Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Model:</label>
          <Select value={selectedModel} onValueChange={setSelectedModel}>
            <SelectTrigger className="border-orange-300">
              <SelectValue placeholder="Select model" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="indic-llm">Indic LLM</SelectItem>
              <SelectItem value="indic-chat">Indic Chat</SelectItem>
              <SelectItem value="government-assistant">Government Assistant</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* API Status */}
        <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
          <strong>Repository:</strong> dwani-ai/llm-indic-server
          <br />
          <strong>Script:</strong> src/chat-dwani.py
          <br />
          <strong>Language:</strong> {language} | <strong>Model:</strong> {selectedModel}
        </div>

        {/* Usage Instructions */}
        <div className="text-xs text-orange-700 bg-orange-50 p-3 rounded border border-orange-200">
          <strong>Setup Instructions:</strong>
          <br />
          1. Clone the dwani-ai/llm-indic-server repository
          <br />
          2. Install dependencies: <code className="bg-white px-1 rounded">pip install -r requirements.txt</code>
          <br />
          3. Set your DAWNI_API_KEY environment variable
          <br />
          4. Run the command above to test the LLM
        </div>
      </CardContent>
    </Card>
  )
}
