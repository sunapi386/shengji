"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft, RotateCcw, Lightbulb, Eye, ChevronRight } from "lucide-react"
import Link from "next/link"
import { useState, type ReactNode } from "react"

interface DrillLayoutProps {
  title: string
  description: string
  children: ReactNode
  onReset?: () => void
  onHint?: () => void
  onShowSolution?: () => void
  gameInfo?: ReactNode
}

export function DrillLayout({
  title,
  description,
  children,
  onReset,
  onHint,
  onShowSolution,
  gameInfo,
}: DrillLayoutProps) {
  const [showInfo, setShowInfo] = useState(true)

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <h1 className="text-sm font-semibold">{title}</h1>
          </div>
          <div className="flex gap-1">
            {onHint && (
              <Button variant="ghost" size="icon" onClick={onHint}>
                <Lightbulb className="w-4 h-4" />
              </Button>
            )}
            {onShowSolution && (
              <Button variant="ghost" size="icon" onClick={onShowSolution}>
                <Eye className="w-4 h-4" />
              </Button>
            )}
            {onReset && (
              <Button variant="ghost" size="icon" onClick={onReset}>
                <RotateCcw className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Collapsible Scenario Info */}
      <div className="border-b border-border bg-muted/30">
        <button
          onClick={() => setShowInfo(!showInfo)}
          className="w-full px-4 py-3 flex items-center justify-between text-left"
        >
          <span className="text-sm font-medium">Scenario</span>
          <ChevronRight className={`w-4 h-4 transition-transform ${showInfo ? "rotate-90" : ""}`} />
        </button>
        {showInfo && (
          <div className="px-4 pb-4 space-y-3">
            <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
            {gameInfo}
          </div>
        )}
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-4">{children}</main>
    </div>
  )
}
