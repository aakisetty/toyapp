'use client'

import { useState } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2 } from "lucide-react"

const PERPLEXITY_API_KEY = process.env.NEXT_PUBLIC_PERPLEXITY_API_KEY

interface ToyInfo {
  name: string
  price: string
  ageRange: string
  developmentalBenefits: string
  rating: string
}

interface ToyComparisonProps {
  toys: string[]
  addToy: (toy: string) => void
  removeToy: (toy: string) => void
}

export default function ToyComparison({ toys, addToy, removeToy }: ToyComparisonProps) {
  const [newToy, setNewToy] = useState('')
  const [toyInfos, setToyInfos] = useState<ToyInfo[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const fetchToyInfo = async (toyName: string) => {
    try {
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'mixtral-8x7b-instruct',
          messages: [
            { role: 'system', content: 'You are a helpful assistant that provides information about toys.' },
            { role: 'user', content: `Provide a brief summary of the toy: ${toyName}. Include name, average price, age range, key developmental benefits, and average rating. Format the response as JSON with keys: name, price, ageRange, developmentalBenefits, and rating.` }
          ]
        })
      })

      if (!response.ok) {
        throw new Error('Failed to fetch toy information')
      }

      const data = await response.json()
      return JSON.parse(data.choices[0].message.content)
    } catch (error) {
      console.error('Error fetching toy information:', error)
      return null
    }
  }

  const handleAddToy = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newToy && toys.length < 3) {
      addToy(newToy)
      setIsLoading(true)
      const toyInfo = await fetchToyInfo(newToy)
      if (toyInfo) {
        setToyInfos([...toyInfos, toyInfo])
      }
      setNewToy('')
      setIsLoading(false)
    }
  }

  return (
    <div>
      <form onSubmit={handleAddToy} className="mb-8">
        <div className="flex gap-2">
          <Input
            type="text"
            value={newToy}
            onChange={(e) => setNewToy(e.target.value)}
            placeholder="Enter toy name"
            className="flex-grow"
          />
          <Button type="submit" disabled={isLoading || toys.length >= 3}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Add Toy'}
          </Button>
        </div>
      </form>

      {toyInfos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Toy Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Age Range</TableHead>
                  <TableHead>Developmental Benefits</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {toyInfos.map((toy, index) => (
                  <TableRow key={index}>
                    <TableCell>{toy.name}</TableCell>
                    <TableCell>{toy.price}</TableCell>
                    <TableCell>{toy.ageRange}</TableCell>
                    <TableCell>{toy.developmentalBenefits}</TableCell>
                    <TableCell>{toy.rating}</TableCell>
                    <TableCell>
                      <Button variant="destructive" onClick={() => removeToy(toy.name)}>Remove</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}