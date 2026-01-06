"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, ArrowRight, CheckCircle2, Swords, Shield } from "lucide-react"
import { markTutorialComplete, getProgress } from "@/lib/progress-store"

interface Lesson {
  id: string
  title: string
  content: React.ReactNode
}

const lessons: Lesson[] = [
  {
    id: "attacker-goals",
    title: "Attacker Strategy",
    content: (
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Swords className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">Playing as Attacker</h3>
            <p className="text-xs text-muted-foreground">Score 80+ points to win</p>
          </div>
        </div>

        <Card>
          <CardContent className="p-4 space-y-3">
            <h4 className="font-medium text-sm">Key Objectives:</h4>
            <ul className="text-sm space-y-2">
              <li className="flex gap-2">
                <span className="text-primary font-bold">1.</span>
                <span>
                  <strong>Draw out trumps early</strong> - Lead trump to exhaust defenders' trump cards
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary font-bold">2.</span>
                <span>
                  <strong>Establish side suits</strong> - After trumps are gone, run your long suits
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary font-bold">3.</span>
                <span>
                  <strong>Bury wisely</strong> - Hide point cards that are hard to protect
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <div className="bg-muted rounded-lg p-4">
          <div className="text-sm font-medium mb-2">The Bury (扣底)</div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            As the declaring attacker, you pick up 8 cards from the "bottom" pile and must bury 8 cards back. These
            buried cards are crucial - if defenders win the last trick, they score ALL the points in the bury (doubled
            if won with a trump pair!).
          </p>
        </div>
      </div>
    ),
  },
  {
    id: "defender-goals",
    title: "Defender Strategy",
    content: (
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center">
            <Shield className="w-6 h-6 text-secondary-foreground" />
          </div>
          <div>
            <h3 className="font-semibold">Playing as Defender</h3>
            <p className="text-xs text-muted-foreground">Keep attackers under 80 points</p>
          </div>
        </div>

        <Card>
          <CardContent className="p-4 space-y-3">
            <h4 className="font-medium text-sm">Key Objectives:</h4>
            <ul className="text-sm space-y-2">
              <li className="flex gap-2">
                <span className="text-secondary-foreground font-bold">1.</span>
                <span>
                  <strong>Preserve trumps</strong> - Don't waste high trumps on low-point tricks
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-secondary-foreground font-bold">2.</span>
                <span>
                  <strong>Lead your long suits</strong> - Force attackers to use their trumps
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-secondary-foreground font-bold">3.</span>
                <span>
                  <strong>Win the last trick</strong> - Capture the buried points!
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <div className="bg-primary/10 rounded-lg p-4 border border-primary/20">
          <div className="text-sm font-medium mb-2">Critical Insight</div>
          <p className="text-xs leading-relaxed">
            As a defender, you should almost <strong>never lead trump</strong>. Leading trump helps the attackers
            establish control. Instead, lead from your longest side suit to make attackers spend their trumps.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: "partnership",
    title: "Partner Communication",
    content: (
      <div className="space-y-4">
        <p className="text-sm leading-relaxed">
          You can't talk to your partner, but you can communicate through your plays!
        </p>

        <Card>
          <CardContent className="p-4 space-y-3">
            <h4 className="font-medium text-sm">Common Signals:</h4>
            <div className="space-y-3">
              <div className="bg-muted rounded p-3">
                <div className="text-xs font-medium mb-1">High Card = "I'm Strong Here"</div>
                <p className="text-xs text-muted-foreground">
                  Playing a high card (like a King or 10) when following suit signals strength in that suit
                </p>
              </div>
              <div className="bg-muted rounded p-3">
                <div className="text-xs font-medium mb-1">Low Card = "I'm Weak Here"</div>
                <p className="text-xs text-muted-foreground">
                  Playing your lowest card suggests you don't have many cards in that suit
                </p>
              </div>
              <div className="bg-muted rounded p-3">
                <div className="text-xs font-medium mb-1">Throwing Points = "Please Win This!"</div>
                <p className="text-xs text-muted-foreground">
                  If your partner leads and you throw points, you're confident they'll win the trick
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <p className="text-sm text-muted-foreground">
          Pay attention to what your partner plays - it tells you a lot about their hand!
        </p>
      </div>
    ),
  },
]

export default function RolesTutorialPage() {
  const [currentLesson, setCurrentLesson] = useState(0)
  const [completedLessons, setCompletedLessons] = useState<Set<number>>(new Set())

  useEffect(() => {
    const progress = getProgress()
    const completed = new Set<number>()
    lessons.forEach((lesson, index) => {
      if (progress.completedTutorials.includes(`roles-${lesson.id}`)) {
        completed.add(index)
      }
    })
    setCompletedLessons(completed)
  }, [])

  const lesson = lessons[currentLesson]
  const progress = (completedLessons.size / lessons.length) * 100

  const handleNext = () => {
    markTutorialComplete(`roles-${lesson.id}`)
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
            <h1 className="text-sm font-semibold truncate">Attacker vs Defender</h1>
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
              <Link href="/tutorial/strategy">
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
      </footer>
    </div>
  )
}
