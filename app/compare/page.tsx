'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import ToyComparison from '@/components/ToyComparison'

export default function ComparePage() {
  const [toys, setToys] = useState<string[]>([])

  const addToy = (toy: string) => {
    if (toys.length < 3 && !toys.includes(toy)) {
      setToys([...toys, toy])
    }
  }

  const removeToy = (toy: string) => {
    setToys(toys.filter(t => t !== toy))
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="container mx-auto py-4">
        <Button asChild variant="ghost">
          <Link href="/">← Back to Home</Link>
        </Button>
      </header>
      <main className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-4">Compare Toys</h1>
        <ToyComparison toys={toys} addToy={addToy} removeToy={removeToy} />
      </main>
    </div>
  )
}