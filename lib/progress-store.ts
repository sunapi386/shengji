// Progress tracking using localStorage
// Tracks completed tutorials, drills, and scenarios

export interface ProgressData {
  completedTutorials: string[] // e.g., ["basics-intro", "basics-points", "roles-attacker-goals"]
  completedDrills: string[] // e.g., ["trumping-decision-1", "optimal-lead-2"]
  drillAttempts: Record<string, { correct: number; total: number }>
  lastActivity: string // ISO date string
}

const STORAGE_KEY = "shengji-progress"

const defaultProgress: ProgressData = {
  completedTutorials: [],
  completedDrills: [],
  drillAttempts: {},
  lastActivity: new Date().toISOString(),
}

export function getProgress(): ProgressData {
  if (typeof window === "undefined") return defaultProgress
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return defaultProgress
    return JSON.parse(stored)
  } catch {
    return defaultProgress
  }
}

export function saveProgress(progress: ProgressData): void {
  if (typeof window === "undefined") return
  try {
    progress.lastActivity = new Date().toISOString()
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
  } catch {
    // Silently fail if localStorage is unavailable
  }
}

export function markTutorialComplete(tutorialId: string): void {
  const progress = getProgress()
  if (!progress.completedTutorials.includes(tutorialId)) {
    progress.completedTutorials.push(tutorialId)
    saveProgress(progress)
  }
}

export function markDrillComplete(drillId: string, scenarioIndex: number): void {
  const progress = getProgress()
  const key = `${drillId}-${scenarioIndex}`
  if (!progress.completedDrills.includes(key)) {
    progress.completedDrills.push(key)
    saveProgress(progress)
  }
}

export function recordDrillAttempt(drillId: string, isCorrect: boolean): void {
  const progress = getProgress()
  if (!progress.drillAttempts[drillId]) {
    progress.drillAttempts[drillId] = { correct: 0, total: 0 }
  }
  progress.drillAttempts[drillId].total++
  if (isCorrect) {
    progress.drillAttempts[drillId].correct++
  }
  saveProgress(progress)
}

export function getTutorialProgress(moduleId: string, totalLessons: number): number {
  const progress = getProgress()
  const completed = progress.completedTutorials.filter((t) => t.startsWith(moduleId)).length
  return Math.round((completed / totalLessons) * 100)
}

export function getDrillAccuracy(drillId: string): number {
  const progress = getProgress()
  const attempts = progress.drillAttempts[drillId]
  if (!attempts || attempts.total === 0) return 0
  return Math.round((attempts.correct / attempts.total) * 100)
}

export function getOverallStats(): {
  tutorialsCompleted: number
  drillsCompleted: number
  overallAccuracy: number
} {
  const progress = getProgress()

  let totalCorrect = 0
  let totalAttempts = 0
  Object.values(progress.drillAttempts).forEach((a) => {
    totalCorrect += a.correct
    totalAttempts += a.total
  })

  return {
    tutorialsCompleted: progress.completedTutorials.length,
    drillsCompleted: progress.completedDrills.length,
    overallAccuracy: totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0,
  }
}

export function resetProgress(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem(STORAGE_KEY)
}
