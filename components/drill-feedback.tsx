"use client"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react"
import type { Solution } from "@/lib/card-types"

interface DrillFeedbackProps {
  solution: Solution | null
  className?: string
}

export function DrillFeedback({ solution, className }: DrillFeedbackProps) {
  if (!solution) {
    return (
      <div className={className}>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Make Your Move</AlertTitle>
          <AlertDescription className="text-pretty">
            Select a card from your hand to play. Consider the strategic implications of your choice.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (solution.isCorrect === true) {
    return (
      <div className={className}>
        <Alert className="border-primary bg-primary/5">
          <CheckCircle2 className="h-4 w-4 text-primary" />
          <AlertTitle className="text-primary">Correct!</AlertTitle>
          <AlertDescription className="text-pretty leading-relaxed">{solution.feedback}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (solution.isCorrect === "partial") {
    return (
      <div className={className}>
        <Alert className="border-gold-accent bg-gold-accent/5">
          <AlertCircle className="h-4 w-4 text-gold-accent" />
          <AlertTitle className="text-gold-accent">Acceptable Move</AlertTitle>
          <AlertDescription className="text-pretty leading-relaxed">{solution.feedback}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className={className}>
      <Alert className="border-destructive bg-destructive/5">
        <XCircle className="h-4 w-4 text-destructive" />
        <AlertTitle className="text-destructive">Incorrect</AlertTitle>
        <AlertDescription className="text-pretty leading-relaxed">{solution.feedback}</AlertDescription>
      </Alert>
    </div>
  )
}
