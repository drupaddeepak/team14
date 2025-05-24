"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Github, Code, FileText } from "lucide-react"

export function DwaniRepositoryInfo() {
  const repositoryUrl = "https://github.com/dwani-ai/llm-indic-server"

  const openRepository = () => {
    window.open(repositoryUrl, "_blank")
  }

  return (
    <Card className="w-full max-w-2xl border-orange-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Github className="w-5 h-5" />
          Dwani LLM Indic Server
          <Badge variant="outline" className="ml-auto">
            Public Repository
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Repository Overview */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Overview</h3>
          <p className="text-sm text-gray-600">Large Language Model for Indic Languages</p>
        </div>

        {/* Repository Structure */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Repository Structure</h3>
          <div className="bg-gray-50 p-3 rounded-md font-mono text-xs space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-blue-600">📁</span>
              <span>dockerfiles/</span>
              <span className="text-gray-500">- Docker configuration</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-blue-600">📁</span>
              <span>docs/</span>
              <span className="text-gray-500">- Documentation</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-blue-600">📁</span>
              <span>requirements/</span>
              <span className="text-gray-500">- Dependencies</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-blue-600">📁</span>
              <span>src/</span>
              <span className="text-gray-500">- Source code</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-600">📄</span>
              <span>llm_code.py</span>
              <span className="text-gray-500">- Main LLM implementation</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-600">📄</span>
              <span>requirements.txt</span>
              <span className="text-gray-500">- Python dependencies</span>
            </div>
          </div>
        </div>

        {/* Technical Details */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Technical Details</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Primary Language:</span>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span>Python (87.1%)</span>
              </div>
            </div>
            <div>
              <span className="font-medium">Container Support:</span>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                <span>Dockerfile (2.6%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* API Integration Status */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Integration Status</h3>
          <div className="bg-orange-50 p-3 rounded-md border border-orange-200">
            <div className="flex items-center gap-2 text-orange-800 text-sm">
              <Code className="w-4 h-4" />
              <span>Integrated with multiple endpoint fallbacks</span>
            </div>
            <div className="text-xs text-orange-600 mt-1">
              Supports various API formats and automatic OpenAI fallback
            </div>
          </div>
        </div>

        {/* Supported Features */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Supported Features</h3>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <Badge variant="outline">Indic Languages</Badge>
            <Badge variant="outline">Government Forms</Badge>
            <Badge variant="outline">Multi-model Support</Badge>
            <Badge variant="outline">API Compatibility</Badge>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button onClick={openRepository} variant="outline" className="flex-1">
            <ExternalLink className="w-4 h-4 mr-2" />
            View Repository
          </Button>
          <Button
            onClick={() => window.open(`${repositoryUrl}/blob/main/README.md`, "_blank")}
            variant="outline"
            className="flex-1"
          >
            <FileText className="w-4 h-4 mr-2" />
            Read Docs
          </Button>
        </div>

        {/* Repository URL */}
        <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded font-mono break-all">{repositoryUrl}</div>
      </CardContent>
    </Card>
  )
}
