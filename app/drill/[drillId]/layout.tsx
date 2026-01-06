import { allDrills } from "@/lib/scenario-data"
import type { ReactNode } from "react"

interface DrillLayoutProps {
  params: Promise<{ drillId: string }>
  children: ReactNode
}

export async function generateStaticParams() {
  return Object.keys(allDrills).map((drillId) => ({
    drillId,
  }))
}

export default async function DrillLayout({ params, children }: DrillLayoutProps) {
  const { drillId } = await params
  const drill = allDrills[drillId]

  if (!drill) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </div>
    </div>
  )
}
