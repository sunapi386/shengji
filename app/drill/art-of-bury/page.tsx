"use client"

import { useState } from "react"
import Link from "next/link"
import { drill02ArtOfBury } from "@/lib/scenario-data"
import { DrillFeedback } from "@/components/drill-feedback"
import type { CardString, Solution } from "@/lib/card-types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { getCardPoints } from "@/lib/card-utils"
import { ArrowLeft, RotateCcw, Lightbulb, Eye, ChevronDown, ChevronUp } from "lucide-react"
import { recordDrillAttempt, markDrillComplete } from "@/lib/progress-store"

export default function ArtOfBuryPage() {
  const drill = drill02ArtOfBury
  const { toast } = useToast()

  const playerSouth = drill.players.find((p) => p.position === "SOUTH")
  const playerHand = playerSouth?.cards || []

  const [selectedCards, setSelectedCards] = useState<CardString[]>([])
  const [currentFeedback, setCurrentFeedback] = useState<Solution | null>(null)
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [showInfo, setShowInfo] = useState(false)

  const handleCardClick = (card: CardString) => {
    if (hasSubmitted) {
      toast({
        title: "Already Submitted",
        description: "Reset the drill to try again",
        variant: "destructive",
      })
      return
    }

    setSelectedCards((prev) => {
      if (prev.includes(card)) {
        return prev.filter((c) => c !== card)
      } else {
        if (prev.length >= 8) {
          toast({
            title: "Maximum Reached",
            description: "You can only bury 8 cards",
            variant: "destructive",
          })
          return prev
        }
        return [...prev, card]
      }
    })
  }

  const handleSubmit = () => {
    if (selectedCards.length !== 8) {
      toast({
        title: "Incomplete Selection",
        description: "You must select exactly 8 cards to bury",
        variant: "destructive",
      })
      return
    }

    const analysis = analyzeBury(selectedCards, playerHand, drill.gameState.trumpSuit, drill.gameState.trumpRank)

    setCurrentFeedback(analysis)
    setHasSubmitted(true)
    recordDrillAttempt("art-of-bury", analysis.isCorrect === true)
    if (analysis.isCorrect === true) {
      markDrillComplete("art-of-bury", 0)
    }
  }

  const handleReset = () => {
    setSelectedCards([])
    setCurrentFeedback(null)
    setHasSubmitted(false)
  }

  const handleHint = () => {
    toast({
      title: "Hint",
      description:
        "Look for high-point cards (Kings, 10s, 5s) to bury. Try to create voids in weak suits while keeping your long suits intact.",
    })
  }

  const handleShowSolution = () => {
    const optimalBury = ["H_4", "H_6", "H_10", "H_K", "C_3", "C_4", "C_6", "C_9"]
    setSelectedCards(optimalBury)
    toast({
      title: "Solution Shown",
      description: "This is one optimal way to bury cards. Click Submit to see the analysis.",
    })
  }

  const totalPoints = selectedCards.reduce((sum, card) => sum + getCardPoints(card), 0)

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
          </div>
          {showInfo ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        {showInfo && (
          <div className="px-4 py-3 border-b border-border bg-muted/20">
            <p className="text-sm text-muted-foreground leading-relaxed">{drill.description}</p>
          </div>
        )}

        {/* Selection Status */}
        <div className="px-4 py-3 border-b border-border">
          <div className="flex items-center justify-between text-sm">
            <div>
              <span className="text-muted-foreground">Selected: </span>
              <span className="font-semibold">{selectedCards.length}/8</span>
            </div>
            <div>
              <span className="text-muted-foreground">Points: </span>
              <span className="font-semibold text-primary">{totalPoints}</span>
            </div>
          </div>
        </div>

        {/* Card Selection */}
        <div className="p-4">
          <h3 className="text-xs font-medium mb-3 text-center text-muted-foreground">Tap cards to select for burial</h3>
          <div className="flex flex-wrap justify-center gap-1.5">
            {playerHand.map((card, index) => {
              const isSelected = selectedCards.includes(card)
              return (
                <button
                  key={`${card}-${index}`}
                  onClick={() => handleCardClick(card)}
                  disabled={hasSubmitted}
                  className={`relative transition-all ${isSelected ? "scale-95" : ""}`}
                >
                  <div
                    className={`w-12 h-16 rounded-md border-2 flex flex-col items-center justify-between p-1 bg-white shadow-sm text-xs ${
                      isSelected ? "border-primary ring-2 ring-primary/30 opacity-60" : "border-gray-200"
                    } ${!hasSubmitted ? "active:scale-95" : ""}`}
                  >
                    {renderCardContent(card)}
                  </div>
                  {isSelected && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-[8px] text-primary-foreground font-bold">
                        {selectedCards.indexOf(card) + 1}
                      </span>
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Submit Button */}
        {!hasSubmitted && (
          <div className="px-4 pb-4">
            <Button onClick={handleSubmit} disabled={selectedCards.length !== 8} className="w-full" size="sm">
              Submit Bury Selection ({selectedCards.length}/8)
            </Button>
          </div>
        )}

        {/* Feedback */}
        {currentFeedback && (
          <div className="px-4 pb-4">
            <DrillFeedback solution={currentFeedback} />
          </div>
        )}

        {/* Next Actions */}
        {hasSubmitted && (
          <div className="px-4 pb-6">
            <Card>
              <CardContent className="p-3">
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleReset} className="flex-1 bg-transparent" size="sm">
                    Try Again
                  </Button>
                  <Button asChild className="flex-1" size="sm">
                    <Link href="/">More Drills</Link>
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

function renderCardContent(card: CardString) {
  if (card === "BIG_JOKER" || card === "SMALL_JOKER") {
    return (
      <>
        <div className="font-bold text-[8px]">{card === "BIG_JOKER" ? "BIG" : "SM"}</div>
        <div className="text-base">{card === "BIG_JOKER" ? "★" : "☆"}</div>
        <div className="font-bold text-[8px]">JKR</div>
      </>
    )
  }

  const parts = card.split("_")
  const suitSymbols: Record<string, string> = { H: "♥", D: "♦", C: "♣", S: "♠" }
  const color = parts[0] === "H" || parts[0] === "D" ? "text-red-600" : "text-gray-900"

  return (
    <>
      <div className={`font-bold ${color} text-[10px]`}>{parts[1]}</div>
      <div className={`${color} text-lg`}>{suitSymbols[parts[0]]}</div>
      <div className={`font-bold ${color} text-[10px]`}>{parts[1]}</div>
    </>
  )
}

function analyzeBury(
  buriedCards: CardString[],
  fullHand: CardString[],
  trumpSuit: string,
  trumpRank: string,
): Solution {
  const pointsBuried = buriedCards.reduce((sum, card) => sum + getCardPoints(card), 0)
  const remainingCards = fullHand.filter((c) => !buriedCards.includes(c))
  const suits = ["H", "D", "C", "S"]
  const voidsCreated: string[] = []

  suits.forEach((suit) => {
    const hasSuitInRemaining = remainingCards.some((card) => card.startsWith(suit))
    const hasSuitInBuried = buriedCards.some((card) => card.startsWith(suit))

    if (!hasSuitInRemaining && hasSuitInBuried) {
      const suitNames: Record<string, string> = { H: "Hearts", D: "Diamonds", C: "Clubs", S: "Spades" }
      voidsCreated.push(suitNames[suit])
    }
  })

  const suitCounts = suits.map((suit) => ({
    suit,
    count: remainingCards.filter((card) => card.startsWith(suit)).length,
  }))
  const longestSuit = suitCounts.reduce((max, curr) => (curr.count > max.count ? curr : max))

  let feedback = ""
  let isCorrect: boolean | "partial" = false

  if (pointsBuried >= 40) {
    feedback += `Excellent! You buried ${pointsBuried} points, putting strong pressure on the defenders. `
    isCorrect = true
  } else if (pointsBuried >= 25) {
    feedback += `Good work. You buried ${pointsBuried} points, which is a reasonable amount. `
    isCorrect = "partial"
  } else {
    feedback += `You only buried ${pointsBuried} points, which is quite low. Look for Kings (10 pts) and 10s (10 pts) to bury. `
    isCorrect = false
  }

  if (voidsCreated.length > 0) {
    feedback += `You successfully created voids in ${voidsCreated.join(" and ")}, giving you excellent trumping opportunities. `
    if (isCorrect === "partial") isCorrect = true
  } else {
    feedback += `You didn't create any voids. Consider burying all cards from your weakest suit to create trumping chances. `
  }

  if (longestSuit.count >= 5) {
    const suitNames: Record<string, string> = { H: "Hearts", D: "Diamonds", C: "Clubs", S: "Spades" }
    feedback += `Your ${suitNames[longestSuit.suit]} suit remains strong with ${longestSuit.count} cards.`
  } else {
    feedback += `Be careful not to weaken your long suits too much.`
    if (isCorrect === true) isCorrect = "partial"
  }

  return { move: "bury-analysis", isCorrect, feedback }
}
