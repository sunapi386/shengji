import { allDrills } from "@/lib/scenario-data"
import DrillPageClient from "./_client"

interface DrillPageProps {
  params: Promise<{ drillId: string }>
}

export function generateStaticParams() {
  return Object.keys(allDrills).map((drillId) => ({
    drillId,
  }))
}

export default async function DrillPage({ params }: DrillPageProps) {
  const resolvedParams = await params
  return <DrillPageClient params={Promise.resolve(resolvedParams)} />
}
