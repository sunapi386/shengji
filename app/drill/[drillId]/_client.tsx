"use client"

import { use, useState, useCallback } from "react"
import Link from "next/link"
import { allDrills } from "@/lib/scenario-data"
import { generateRandomScenario, exportScenario, importScenario } from "@/lib/scenario-generator"
import { CardTable } from "@/components/card-table"
import { PlayerHand } from "@/components/player-hand"
import { DrillFeedback } from "@/components/drill-feedback"
import type { CardString, Solution, DrillScenario } from "@/lib/card-types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, RotateCcw, Lightbulb, Eye, ChevronDown, ChevronUp, Shuffle, Download, Upload } from "lucide-react"
import { recordDrillAttempt, markDrillComplete } from "@/lib/progress-store"

interface DrillPageProps {
  params: Promise<{ drillId: string }>
}

export default function DrillPageClient({ params }: DrillPageProps) {
  const { drillId } = use(params)
  const baseDrill = allDrills[drillId]
  const { toast } = useToast()

  const [drill, setDrill] = useState<DrillScenario | null>(baseDrill || null)
  const [selectedCard, setSelectedCard] = useState<CardString | null>(null)
  const [currentFeedback, setCurrentFeedback] = useState<Solution | null>(null)
  const [hasPlayed, setHasPlayed] = useState(false)
  const [showInfo, setShowInfo] = useState(false)

  const handleRandomize = useCallback(() => {
    const newScenario = generateRandomScenario(drillId)
    setDrill(newScenario)
    setSelectedCard(null)
    setCurrentFeedback(null)
    setHasPlayed(false)
    toast({ title: "New Scenario", description: "Random scenario generated!" })
  }, [drillId, toast])

  const handleExport = useCallback(() => {
    if (!drill) return

    const json = exportScenario(drill)
    const blob = new Blob([json], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `shengji-drill-${drill.scenarioId}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast({ title: "Exported", description: "Drill scenario downloaded" })
  }, [drill, toast])

  const handleImport = useCallback(() => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".json"
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      try {
        const text = await file.text()
        const imported = importScenario(text)
        if (imported) {
          setDrill(imported)
          setSelectedCard(null)
          setCurrentFeedback(null)
          setHasPlayed(false)
          toast({ title: "Imported", description: "Drill scenario loaded!" })
        } else {
          toast({ title: "Invalid file", description: "Could not parse drill scenario", variant: "destructive" })
        }
      } catch {
        toast({ title: "Error", description: "Failed to read file", variant: "destructive" })
      }
    }
    input.click()
  }, [toast])

  if (!drill) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 max-w-lg mx-auto">
        <div className="text-center">
          <h1 className="text-xl font-bold mb-2">Drill Not Found</h1>
          <p className="text-muted-foreground text-sm mb-4">The requested drill does not exist.</p>
          <Button asChild size="sm">
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    )
  }

  const playerSouth = drill.players.find((p) => p.position === "SOUTH")
  const playerHand = playerSouth?.cards || []

  const handleCardClick = (card: CardString) => {
    if (hasPlayed) {
      toast({
        title: "Already Played",
        description: "Reset the drill to try again",
        variant: "destructive",
      })
      return
    }

    setSelectedCard(card)

    const solution = drill.solutions.find((s) => s.move === card)

    if (solution) {
      setCurrentFeedback(solution)
      setHasPlayed(true)
      recordDrillAttempt(drillId, solution.isCorrect === true)
      if (solution.isCorrect === true) {
        markDrillComplete(drillId, 0)
      }
    } else {
      setCurrentFeedback({
        move: card,
        isCorrect: false,
        feedback: "This card wasn't considered in the drill. Try selecting a different card from your hand.",
      })
      recordDrillAttempt(drillId, false)
    }
  }

  const handleReset = () => {
    setSelectedCard(null)
    setCurrentFeedback(null)
    setHasPlayed(false)
  }

  const handleHint = () => {
    toast({
      title: "Hint",
      description: "Consider which cards you can afford to lose and which you need to save for later.",
    })
  }

  const handleShowSolution = () => {
    const correctSolution = drill.solutions.find((s) => s.isCorrect === true)
    if (correctSolution) {
      setSelectedCard(correctSolution.move)
      setCurrentFeedback(correctSolution)
      setHasPlayed(true)
    }
  }

  const displayPlayers = drill.players.map((player) => ({
    position: player.position,
    label: player.position,
    role: player.role,
    cardCount: player.cards[0]?.startsWith("face-down")
      ? Number.parseInt(player.cards[0].split("-")[2])
      : player.cards.length,
  }))

  const getCardPoints = (card: CardString): number => {
    if (card.includes("K") || card.includes("10")) return 10
    if (card.includes("5")) return 5
    return 0
  }
  const pointsOnTable = drill.currentTrick.cardsPlayed.reduce((sum, play) => sum + getCardPoints(play.card), 0)

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-lg mx-auto">
      {/* Header */}
      <header className="border-b border-border bg-card px-3 py-3 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="shrink-0 -ml-2" asChild>
              <Link href="/">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <div className="min-w-0">
              <h1 className="text-sm font-semibold truncate">{drill.title}</h1>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Badge variant="outline" className="text-[10px] px-1 py-0">
                  {drill.gameState.trumpSuit}
                </Badge>
                <span>Rank {drill.gameState.trumpRank}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-0.5">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleRandomize} title="Random Scenario">
              <Shuffle className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleExport} title="Export Drill">
              <Download className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleImport} title="Import Drill">
              <Upload className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleHint}>
              <Lightbulb className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleShowSolution}>
              <Eye className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleReset}>
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Collapsible Scenario Info */}
        <button
          onClick={() => setShowInfo(!showInfo)}
          className="w-full px-4 py-2.5 flex items-center justify-between text-left border-b border-border bg-muted/30"
        >
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium">Scenario Info</span>
            <Badge variant="secondary" className="text-[10px]">
              {playerSouth?.role}
            </Badge>
            <Badge variant="outline" className="text-[10px]">
              {pointsOnTable} pts on table
            </Badge>
          </div>
          {showInfo ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        {showInfo && (
          <div className="px-4 py-3 border-b border-border bg-muted/20">
            <p className="text-sm text-muted-foreground leading-relaxed">{drill.description}</p>
          </div>
        )}

        {/* Card Table */}
        <div className="p-3">
          <CardTable
            players={displayPlayers}
            currentTrick={drill.currentTrick.cardsPlayed}
            trumpSuit={drill.gameState.trumpSuit}
            trumpRank={drill.gameState.trumpRank}
          />
        </div>

        {/* Your Hand */}
        <div className="px-3 pb-3">
          <h3 className="text-xs font-medium mb-2 text-center text-muted-foreground">Tap a card to play</h3>
          <PlayerHand
            cards={playerHand}
            onCardClick={handleCardClick}
            selectedCard={selectedCard}
            trumpSuit={drill.gameState.trumpSuit}
            trumpRank={drill.gameState.trumpRank}
          />
        </div>

        {/* Feedback */}
        {currentFeedback && (
          <div className="px-3 pb-3">
            <DrillFeedback solution={currentFeedback} />
          </div>
        )}

        {/* Next Actions */}
        {hasPlayed && (
          <div className="px-3 pb-6">
            <Card>
              <CardContent className="p-3">
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleReset} className="flex-1 bg-transparent" size="sm">
                    Try Again
                  </Button>
                  <Button variant="outline" onClick={handleRandomize} className="flex-1 bg-transparent" size="sm">
                    <Shuffle className="w-4 h-4 mr-1" />
                    New Scenario
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
