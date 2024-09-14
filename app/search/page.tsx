import ToySearch from '@/components/ToySearch'
import Link from 'next/link'
import { Button } from "@/components/ui/button"

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="container mx-auto py-4">
        <Button asChild variant="ghost">
          <Link href="/">← Back to Home</Link>
        </Button>
      </header>
      <main className="container mx-auto py-6">
        <ToySearch />
      </main>
    </div>
  )
}