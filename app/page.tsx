import { Button } from "@/components/ui/button"
import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-6">Welcome to ToyCompare</h1>
      <p className="text-xl mb-8">Find the perfect toy for your child's development</p>
      <div className="space-x-4">
        <Button asChild>
          <Link href="/search">Search Toys</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/compare">Compare Toys</Link>
        </Button>
      </div>
    </div>
  )
}