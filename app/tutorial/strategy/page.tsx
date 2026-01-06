"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, ArrowRight, CheckCircle2, AlertTriangle, Lightbulb } from "lucide-react"
import { markTutorialComplete, getProgress } from "@/lib/progress-store"

interface Lesson {
  id: string
  title: string
  content: React.ReactNode
}

const lessons: Lesson[] = [
  {
    id: "trump-management",
    title: "Trump Management",
    content: (
      <div className="space-y-4">
        <p className="text-sm leading-relaxed">
          Your trump cards are your most valuable resource. Using them wisely is the difference between winning and
          losing.
        </p>

        <Card className="border-amber-500/50 bg-amber-500/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div className="text-sm font-medium">Common Mistake</div>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              New players often use their Big Joker or trump Jack to win 20-point tricks. This is usually wrong! A
              20-point trick isn't worth your strongest card.
            </p>
          </CardContent>
        </Card>

        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-2 mb-3">
              <Lightbulb className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div className="text-sm font-medium">The Right Approach</div>
            </div>
            <ul className="text-xs space-y-2 text-muted-foreground">
              <li>
                • <strong>Save high trumps</strong> for 40+ point tricks or control moments
              </li>
              <li>
                • <strong>Use low trumps</strong> when you must win but points are minimal
              </li>
              <li>
                • <strong>Sometimes don't trump</strong> - discarding is often better
              </li>
            </ul>
          </CardContent>
        </Card>

        <div className="bg-muted rounded-lg p-4">
          <div className="text-sm font-medium mb-2">Rule of Thumb</div>
          <p className="text-xs text-muted-foreground">
            If there are fewer than 30 points on the trick and you'd need a strong trump to win, consider just
            discarding a worthless card instead.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: "leading",
    title: "Leading Strategy",
    content: (
      <div className="space-y-4">
        <p className="text-sm leading-relaxed">
          When you win a trick, you get to lead the next one. This is a powerful position - use it wisely!
        </p>

        <div className="space-y-3">
          <Card>
            <CardContent className="p-4">
              <h4 className="font-medium text-sm mb-2 text-primary">As Attacker</h4>
              <ul className="text-xs space-y-1.5 text-muted-foreground">
                <li>✓ Lead trumps early to draw out defender trumps</li>
                <li>✓ After trumps are exhausted, run your long suits</li>
                <li>✓ Lead high cards to establish winners</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h4 className="font-medium text-sm mb-2 text-secondary-foreground">As Defender</h4>
              <ul className="text-xs space-y-1.5 text-muted-foreground">
                <li>✓ Lead your longest non-trump suit</li>
                <li>✓ Force attackers to spend their trumps</li>
                <li>✗ Never lead trumps unless you have 6+ trumps</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="bg-primary/10 rounded-lg p-4 border border-primary/20">
          <div className="text-sm font-medium mb-2">Optimal Lead Position</div>
          <p className="text-xs leading-relaxed">
            With a 7-card suit (like 7 hearts), leading from it repeatedly will likely exhaust everyone else's cards in
            that suit, forcing them to trump or discard.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: "counting",
    title: "Card Counting Basics",
    content: (
      <div className="space-y-4">
        <p className="text-sm leading-relaxed">
          You don't need to count every card, but tracking a few key things will dramatically improve your play.
        </p>

        <Card>
          <CardContent className="p-4 space-y-3">
            <h4 className="font-medium text-sm">What to Track:</h4>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <Badge variant="secondary" className="shrink-0">
                  1
                </Badge>
                <div className="text-xs">
                  <strong>How many trumps are left?</strong>
                  <p className="text-muted-foreground">Start at ~30 trumps total (varies by trump rank)</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Badge variant="secondary" className="shrink-0">
                  2
                </Badge>
                <div className="text-xs">
                  <strong>Are the jokers played?</strong>
                  <p className="text-muted-foreground">Once both jokers are gone, your trump A is now strongest</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Badge variant="secondary" className="shrink-0">
                  3
                </Badge>
                <div className="text-xs">
                  <strong>Who is void in which suit?</strong>
                  <p className="text-muted-foreground">If East trumped clubs, they're out of clubs - remember this!</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="bg-muted rounded-lg p-4">
          <div className="text-sm font-medium mb-2">Pro Tip</div>
          <p className="text-xs text-muted-foreground">
            Start by just counting point cards (K, 10, 5). Knowing "40 points are already played" helps you make better
            decisions about when to fight for tricks.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: "endgame",
    title: "Endgame Tactics",
    content: (
      <div className="space-y-4">
        <p className="text-sm leading-relaxed">
          The last few tricks are critical, especially the final trick which determines who gets the buried points!
        </p>

        <Card className="border-red-500/50 bg-red-500/5">
          <CardContent className="p-4">
            <div className="text-sm font-medium mb-2 text-red-600">The Last Trick</div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              If defenders win the last trick, they capture all points in the buried pile. If won with:
            </p>
            <ul className="text-xs mt-2 space-y-1 text-muted-foreground">
              <li>• Single card: Buried points × 1</li>
              <li>• Pair: Buried points × 2</li>
              <li>• Tractor: Buried points × 4</li>
            </ul>
          </CardContent>
        </Card>

        <div className="space-y-3">
          <div className="bg-muted rounded-lg p-4">
            <div className="text-sm font-medium mb-2">Attacker Endgame</div>
            <p className="text-xs text-muted-foreground">
              Save one high trump (Joker or trump A) to guarantee winning the last trick. Don't let defenders steal your
              buried points!
            </p>
          </div>

          <div className="bg-muted rounded-lg p-4">
            <div className="text-sm font-medium mb-2">Defender Endgame</div>
            <p className="text-xs text-muted-foreground">
              Save your highest trump pair for the last trick if possible. Winning with a pair doubles the buried points
              - potentially a 80+ point swing!
            </p>
          </div>
        </div>

        <div className="bg-primary/10 rounded-lg p-4 border border-primary/20 text-center">
          <p className="text-sm font-medium">Ready to practice these strategies?</p>
          <Button size="sm" asChild className="mt-2">
            <Link href="/drill/trumping-decision">Try a Drill</Link>
          </Button>
        </div>
      </div>
    ),
  },
]

export default function StrategyTutorialPage() {
  const [currentLesson, setCurrentLesson] = useState(0)
  const [completedLessons, setCompletedLessons] = useState<Set<number>>(new Set())

  useEffect(() => {
    const progress = getProgress()
    const completed = new Set<number>()
    lessons.forEach((lesson, index) => {
      if (progress.completedTutorials.includes(`strategy-${lesson.id}`)) {
        completed.add(index)
      }
    })
    setCompletedLessons(completed)
  }, [])

  const lesson = lessons[currentLesson]
  const progress = (completedLessons.size / lessons.length) * 100

  const handleNext = () => {
    markTutorialComplete(`strategy-${lesson.id}`)
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

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-4xl mx-auto">
      <header className="border-b border-border bg-card px-3 py-3 sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="shrink-0 -ml-2" asChild>
            <Link href="/">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-semibold truncate">Core Strategies</h1>
            <div className="flex items-center gap-2">
              <Progress value={progress} className="h-1.5 flex-1" />
              <span className="text-xs text-muted-foreground shrink-0">
                {completedLessons.size}/{lessons.length}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="border-b border-border bg-card px-3 py-2 overflow-x-auto scrollbar-hide">
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

      <main className="flex-1 overflow-auto p-4 pb-24">
        <div className="mb-4">
          <Badge variant="secondary" className="mb-2 text-xs">
            Lesson {currentLesson + 1}
          </Badge>
          <h2 className="text-lg font-bold">{lesson.title}</h2>
        </div>
        {lesson.content}
      </main>

      <footer className="fixed bottom-0 left-0 right-0 border-t border-border bg-card px-4 py-3 safe-area-bottom max-w-4xl mx-auto">
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
              <Link href="/">
                Complete
                <CheckCircle2 className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          ) : (
            <Button onClick={handleNext} className="flex-1" size="sm">
              Continue
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>
      </footer>
    </div>
  )
}
