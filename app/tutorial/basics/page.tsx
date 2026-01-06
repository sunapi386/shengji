"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react"
import { markTutorialComplete, getProgress } from "@/lib/progress-store"

interface Lesson {
  id: string
  title: string
  content: React.ReactNode
}

const lessons: Lesson[] = [
  {
    id: "intro",
    title: "What is Shengji?",
    content: (
      <div className="space-y-4">
        <p className="text-sm leading-relaxed">
          <strong>Shengji</strong> (升级, meaning "Level Up") is a popular Chinese trick-taking card game for 4 players
          in fixed partnerships. Players sit across from their partners.
        </p>
        <div className="bg-muted rounded-lg p-4">
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div></div>
            <div className="bg-card rounded p-2 border">
              <div className="font-medium">North</div>
              <div className="text-muted-foreground">Partner</div>
            </div>
            <div></div>
            <div className="bg-card rounded p-2 border">
              <div className="font-medium">West</div>
              <div className="text-muted-foreground">Opponent</div>
            </div>
            <div className="bg-primary/10 rounded p-2 border border-primary">
              <div className="font-medium text-primary">You</div>
              <div className="text-muted-foreground">South</div>
            </div>
            <div className="bg-card rounded p-2 border">
              <div className="font-medium">East</div>
              <div className="text-muted-foreground">Opponent</div>
            </div>
          </div>
        </div>
        <p className="text-sm leading-relaxed">
          The game uses <strong>two standard decks</strong> (108 cards including jokers). Your goal is to collect points
          by winning tricks containing point cards.
        </p>
      </div>
    ),
  },
  {
    id: "points",
    title: "Point Cards",
    content: (
      <div className="space-y-4">
        <p className="text-sm leading-relaxed">Only certain cards are worth points. Everything else is worth 0.</p>
        <div className="space-y-2">
          {[
            { cards: "Kings (K)", points: 10, color: "bg-amber-500" },
            { cards: "Tens (10)", points: 10, color: "bg-amber-500" },
            { cards: "Fives (5)", points: 5, color: "bg-amber-400" },
          ].map((item) => (
            <div key={item.cards} className="flex items-center gap-3 bg-muted rounded-lg p-3">
              <div className={`w-10 h-14 ${item.color} rounded flex items-center justify-center text-white font-bold`}>
                {item.cards.split(" ")[0].replace("s", "").replace("(", "").replace(")", "")}
              </div>
              <div className="flex-1">
                <div className="font-medium text-sm">{item.cards}</div>
                <div className="text-xs text-muted-foreground">Each card worth {item.points} points</div>
              </div>
              <Badge variant="secondary" className="text-lg font-bold">
                {item.points}
              </Badge>
            </div>
          ))}
        </div>
        <p className="text-sm text-muted-foreground">
          Total points in the deck: <strong>200 points</strong> (2 decks × 100 points each)
        </p>
      </div>
    ),
  },
  {
    id: "trump",
    title: "The Trump System",
    content: (
      <div className="space-y-4">
        <p className="text-sm leading-relaxed">
          In Shengji, there's a <strong>trump suit</strong> and a <strong>trump rank</strong>. Trump cards beat all
          non-trump cards.
        </p>
        <div className="bg-muted rounded-lg p-4 space-y-3">
          <div className="text-sm font-medium">Example: Trump is Hearts, Rank is 7</div>
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <Badge className="bg-red-600">Strongest</Badge>
              <span>Big Joker, Small Joker</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-red-500">Very Strong</Badge>
              <span>7 of Hearts (trump suit + trump rank)</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-orange-500">Strong</Badge>
              <span>Other 7s (trump rank in other suits)</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-yellow-500">Good</Badge>
              <span>Hearts A, K, Q, J, 10... (trump suit)</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Normal</Badge>
              <span>All other cards (side suits)</span>
            </div>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Learning when to use your trump cards is the key skill in Shengji!
        </p>
      </div>
    ),
  },
  {
    id: "roles",
    title: "Attackers vs Defenders",
    content: (
      <div className="space-y-4">
        <p className="text-sm leading-relaxed">
          Each round, one team are <strong>Attackers</strong> and the other are <strong>Defenders</strong>.
        </p>
        <div className="grid gap-3">
          <Card className="border-primary/50 bg-primary/5">
            <CardContent className="p-4">
              <div className="font-semibold text-sm mb-2 text-primary">Attackers</div>
              <ul className="text-xs space-y-1 text-muted-foreground">
                <li>• Need to collect 80+ points to win</li>
                <li>• One attacker is the "dealer" who picks up 8 cards</li>
                <li>• Dealer chooses which cards to "bury" (hide)</li>
                <li>• Buried cards count as points if defenders win last trick</li>
              </ul>
            </CardContent>
          </Card>
          <Card className="border-secondary/50 bg-secondary/5">
            <CardContent className="p-4">
              <div className="font-semibold text-sm mb-2">Defenders</div>
              <ul className="text-xs space-y-1 text-muted-foreground">
                <li>• Need to prevent attackers from getting 80 points</li>
                <li>• Should try to win the last trick (captures buried points)</li>
                <li>• Focus on saving their strong cards for crucial moments</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    ),
  },
  {
    id: "tricks",
    title: "Playing Tricks",
    content: (
      <div className="space-y-4">
        <p className="text-sm leading-relaxed">
          Each trick starts with a <strong>lead card</strong>. Other players must follow suit if they can.
        </p>
        <div className="bg-muted rounded-lg p-4 space-y-3">
          <div className="text-sm font-medium">Trick Rules:</div>
          <ol className="text-xs space-y-2 list-decimal list-inside">
            <li>
              <strong>Must follow suit</strong> - If clubs are led and you have clubs, you must play clubs
            </li>
            <li>
              <strong>Can trump</strong> - If you can't follow suit, you may play a trump card
            </li>
            <li>
              <strong>Can discard</strong> - If you can't follow and don't want to trump, play any card
            </li>
            <li>
              <strong>Highest wins</strong> - Highest card of the led suit wins, unless trumped
            </li>
          </ol>
        </div>
        <div className="text-sm p-3 bg-primary/10 rounded-lg border border-primary/20">
          <strong>Key Insight:</strong> Discarding a non-point card when you can't follow is often the best play! Don't
          waste trumps on small tricks.
        </div>
      </div>
    ),
  },
]

export default function BasicsTutorialPage() {
  const [currentLesson, setCurrentLesson] = useState(0)
  const [completedLessons, setCompletedLessons] = useState<Set<number>>(new Set())

  useEffect(() => {
    const progress = getProgress()
    const completed = new Set<number>()
    lessons.forEach((lesson, index) => {
      if (progress.completedTutorials.includes(`basics-${lesson.id}`)) {
        completed.add(index)
      }
    })
    setCompletedLessons(completed)
  }, [])

  const lesson = lessons[currentLesson]
  const progress = (completedLessons.size / lessons.length) * 100

  const handleNext = () => {
    markTutorialComplete(`basics-${lesson.id}`)
    setCompletedLessons((prev) => new Set([...prev, currentLesson]))
    if (currentLesson < lessons.length - 1) {
      setCurrentLesson(currentLesson + 1)
    }
  }

  const handlePrev = () => {
    if (currentLesson > 0) {
      setCurrentLesson(currentLesson - 1)
    }
  }

  const isLastLesson = currentLesson === lessons.length - 1
  const allCompleted = completedLessons.size === lessons.length

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card px-4 py-3 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="shrink-0 -ml-2" asChild>
            <Link href="/">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-semibold truncate">Shengji Basics</h1>
            <div className="flex items-center gap-2">
              <Progress value={progress} className="h-1.5 flex-1" />
              <span className="text-xs text-muted-foreground shrink-0">
                {completedLessons.size}/{lessons.length}
              </span>
            </div>
          </div>
        </div>
        </div>
      </header>

      {/* Lesson Navigation - Horizontal scroll */}
      <div className="border-b border-border bg-card">
        <div className="max-w-4xl mx-auto px-4 py-2 overflow-x-auto scrollbar-hide">
        <div className="flex gap-2 min-w-max">
          {lessons.map((l, i) => (
            <button
              key={l.id}
              onClick={() => setCurrentLesson(i)}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                i === currentLesson
                  ? "bg-primary text-primary-foreground"
                  : completedLessons.has(i)
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              {completedLessons.has(i) && <CheckCircle2 className="w-3 h-3" />}
              <span className="max-w-20 truncate">{l.title}</span>
            </button>
          ))}
        </div>
        </div>
      </div>

      {/* Lesson Content */}
      <main className="flex-1 overflow-auto pb-24">
        <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="mb-4">
          <Badge variant="secondary" className="mb-2 text-xs">
            Lesson {currentLesson + 1}
          </Badge>
          <h2 className="text-lg font-bold">{lesson.title}</h2>
        </div>
        {lesson.content}
        </div>
      </main>

      {/* Navigation Footer */}
      <footer className="fixed bottom-0 left-0 right-0 border-t border-border bg-card safe-area-bottom">
        <div className="max-w-4xl mx-auto px-4 py-3">
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={currentLesson === 0}
            className="flex-1 bg-transparent"
            size="sm"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
          {isLastLesson ? (
            <Button asChild className="flex-1" size="sm">
              <Link href="/tutorial/roles">
                Next Module
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          ) : (
            <Button onClick={handleNext} className="flex-1" size="sm">
              Continue
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>
        </div>
      </footer>
    </div>
  )
}
