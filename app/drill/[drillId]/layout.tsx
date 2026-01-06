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
    <div className="container py-8">
      <div className="space-y-4">
        
        
        {/* Placeholder for game info, drill layout, etc. */}
        <div className="border rounded-lg p-4">
          {/* This is where the DrillPage content will be rendered */}
          {children}
        </div>
      </div>
    </div>
  )
}
