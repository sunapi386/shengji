"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  BookOpen,
  Target,
  TrendingUp,
  GraduationCap,
  ChevronRight,
  Trophy,
  Clock,
  Home,
  Dumbbell,
  BarChart3,
  Users,
} from "lucide-react"
import { getOverallStats, getTutorialProgress, getDrillAccuracy } from "@/lib/progress-store"

type TabType = "home" | "drills" | "progress"

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<TabType>("home")
  const [stats, setStats] = useState({ tutorialsCompleted: 0, drillsCompleted: 0, overallAccuracy: 0 })
  const [tutorialProgress, setTutorialProgress] = useState({ basics: 0, roles: 0, strategy: 0 })
  const [drillAccuracy, setDrillAccuracy] = useState({ trumping: 0, bury: 0, lead: 0 })

  useEffect(() => {
    setStats(getOverallStats())
    setTutorialProgress({
      basics: getTutorialProgress("basics", 5),
      roles: getTutorialProgress("roles", 3),
      strategy: getTutorialProgress("strategy", 4),
    })
    setDrillAccuracy({
      trumping: getDrillAccuracy("trumping-decision"),
      bury: getDrillAccuracy("art-of-bury"),
      lead: getDrillAccuracy("optimal-lead"),
    })
  }, [])

  const drills = [
    {
      id: "trumping-decision",
      title: "The Trumping Decision",
      subtitle: "To Bi or Not to Bi",
      description: "Learn when to use trump cards on side-suit tricks",
      icon: Target,
      difficulty: "Beginner",
      estimatedTime: "5 min",
      scenarios: 3,
      accuracy: drillAccuracy.trumping,
    },
    {
      id: "art-of-bury",
      title: "The Art of the Bury",
      subtitle: "Strategic Card Selection",
      description: "Master card selection for the bottom pile",
      icon: BookOpen,
      difficulty: "Intermediate",
      estimatedTime: "10 min",
      scenarios: 2,
      accuracy: drillAccuracy.bury,
    },
    {
      id: "optimal-lead",
      title: "The Optimal Lead",
      subtitle: "Opening Play Strategy",
      description: "Choose the best opening card",
      icon: TrendingUp,
      difficulty: "Beginner",
      estimatedTime: "5 min",
      scenarios: 3,
      accuracy: drillAccuracy.lead,
    },
  ]

  const tutorialModules = [
    {
      id: "basics",
      title: "Shengji Basics",
      description: "Card hierarchy, trump system, and basic mechanics",
      lessons: 5,
      progress: tutorialProgress.basics,
    },
    {
      id: "roles",
      title: "Attacker vs Defender",
      description: "Understanding your role and objectives",
      lessons: 3,
      progress: tutorialProgress.roles,
    },
    {
      id: "strategy",
      title: "Core Strategies",
      description: "Essential tactics for winning games",
      lessons: 4,
      progress: tutorialProgress.strategy,
    },
  ]

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-lg mx-auto">
      <main className="flex-1 overflow-auto pb-20">
        {activeTab === "home" && (
          <div className="p-4 space-y-4">
            {/* Compact Header */}
            <div className="flex items-center gap-3 py-2">
              <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shrink-0">
                <span className="text-primary-foreground text-2xl font-bold">升</span>
              </div>
              <div>
                <h1 className="text-xl font-bold">Shengji Lab</h1>
                <p className="text-xs text-muted-foreground">Master through practice</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3">
              <Link href="/tutorial/basics" className="block">
                <Card className="h-full hover:bg-accent/50 active:scale-[0.98] transition-all">
                  <CardContent className="p-4 flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
                      <GraduationCap className="w-6 h-6 text-primary" />
                    </div>
                    <span className="font-medium text-sm">Learn Basics</span>
                    <span className="text-xs text-muted-foreground">New to Shengji?</span>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/drill/trumping-decision" className="block">
                <Card className="h-full hover:bg-accent/50 active:scale-[0.98] transition-all">
                  <CardContent className="p-4 flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center mb-2">
                      <Target className="w-6 h-6 text-amber-600" />
                    </div>
                    <span className="font-medium text-sm">Quick Drill</span>
                    <span className="text-xs text-muted-foreground">Jump into practice</span>
                  </CardContent>
                </Card>
              </Link>
            </div>

            <Link href="/multiplayer" className="block">
              <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20 hover:bg-primary/15 active:scale-[0.98] transition-all">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm">Multiplayer</h3>
                    <p className="text-xs text-muted-foreground">Play with friends or AI opponents</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>

            {/* Tutorial Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold">Tutorials</h2>
                <Badge variant="secondary" className="text-xs">
                  {tutorialModules.length} modules
                </Badge>
              </div>
              <div className="space-y-2">
                {tutorialModules.map((module) => (
                  <Link key={module.id} href={`/tutorial/${module.id}`}>
                    <Card className="hover:bg-accent/50 active:scale-[0.98] transition-all">
                      <CardContent className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h3 className="font-medium text-sm truncate">{module.title}</h3>
                              <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                            </div>
                            <p className="text-xs text-muted-foreground truncate">{module.description}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Progress value={module.progress} className="h-1 flex-1" />
                              <span className="text-[10px] text-muted-foreground w-8">{module.progress}%</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>

            {/* Recent Activity / Continue */}
            {stats.drillsCompleted > 0 && (
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-sm">Keep Going!</h3>
                      <p className="text-xs text-muted-foreground">{stats.drillsCompleted} scenarios completed</p>
                    </div>
                    <Button size="sm" onClick={() => setActiveTab("drills")}>
                      Continue
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {activeTab === "drills" && (
          <div className="p-4 space-y-3">
            <div className="py-2">
              <h1 className="text-xl font-bold">Practice Drills</h1>
              <p className="text-sm text-muted-foreground">Train your strategic thinking</p>
            </div>

            {drills.map((drill) => {
              const Icon = drill.icon
              const href = drill.id === "art-of-bury" ? "/drill/art-of-bury" : `/drill/${drill.id}`
              return (
                <Link key={drill.id} href={href}>
                  <Card className="hover:bg-accent/50 transition-colors active:scale-[0.98]">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                          <Icon className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="font-semibold text-sm">{drill.title}</h3>
                              <p className="text-xs text-muted-foreground">{drill.subtitle}</p>
                            </div>
                            <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{drill.description}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <Badge
                              variant={drill.difficulty === "Beginner" ? "secondary" : "outline"}
                              className="text-[10px] px-1.5 py-0"
                            >
                              {drill.difficulty}
                            </Badge>
                            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              {drill.estimatedTime}
                            </span>
                            {drill.accuracy > 0 && (
                              <span className="text-[10px] text-primary font-medium">{drill.accuracy}% accuracy</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        )}

        {activeTab === "progress" && (
          <div className="p-4 space-y-4">
            <div className="py-2">
              <h1 className="text-xl font-bold">Your Progress</h1>
              <p className="text-sm text-muted-foreground">Track your learning journey</p>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-3 gap-3">
              <Card>
                <CardContent className="p-3 text-center">
                  <div className="text-2xl font-bold text-primary">{stats.tutorialsCompleted}</div>
                  <div className="text-[10px] text-muted-foreground">Lessons</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 text-center">
                  <div className="text-2xl font-bold text-primary">{stats.drillsCompleted}</div>
                  <div className="text-[10px] text-muted-foreground">Scenarios</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 text-center">
                  <div className="text-2xl font-bold text-primary">{stats.overallAccuracy}%</div>
                  <div className="text-[10px] text-muted-foreground">Accuracy</div>
                </CardContent>
              </Card>
            </div>

            {/* Tutorial Progress */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-medium text-sm mb-3">Tutorial Progress</h3>
                <div className="space-y-3">
                  {tutorialModules.map((module) => (
                    <div key={module.id} className="flex items-center gap-3">
                      <div className="flex-1">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span>{module.title}</span>
                          <span className="text-muted-foreground">{module.progress}%</span>
                        </div>
                        <Progress value={module.progress} className="h-1.5" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Drill Performance */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-medium text-sm mb-3">Drill Performance</h3>
                <div className="space-y-3">
                  {drills.map((drill) => (
                    <div key={drill.id} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{drill.title}</span>
                      <span className="font-medium">{drill.accuracy > 0 ? `${drill.accuracy}%` : "Not started"}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Achievements placeholder */}
            {stats.drillsCompleted === 0 && stats.tutorialsCompleted === 0 && (
              <Card className="bg-muted/50">
                <CardContent className="p-6 text-center">
                  <Trophy className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                  <h3 className="font-medium mb-1">Start Your Journey</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Complete tutorials and drills to track your progress
                  </p>
                  <Button size="sm" onClick={() => setActiveTab("home")}>
                    Get Started
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border safe-area-bottom max-w-lg mx-auto">
        <div className="flex">
          {[
            { key: "home" as TabType, label: "Home", icon: Home },
            { key: "drills" as TabType, label: "Drills", icon: Dumbbell },
            { key: "progress" as TabType, label: "Progress", icon: BarChart3 },
          ].map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.key
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "stroke-[2.5]" : ""}`} />
                <span className={isActive ? "font-medium" : ""}>{tab.label}</span>
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
