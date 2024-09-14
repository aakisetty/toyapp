'use client'

import { useState } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import Image from 'next/image'

interface ToyInfo {
  name: string
  imageUrl: string | null
  price: {
    amazon: string | number | null
    target: string | number | null
  }
  description: string
  ageRange: string
  cognitiveSkills: string[]
  reviews: {
    average: number | null
    count: number | null
  }
}

export default function ToySearch() {
  const [toyQuery, setToyQuery] = useState('')
  const [toyInfo, setToyInfo] = useState<ToyInfo | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchToyInfo = async () => {
    setIsLoading(true)
    setError(null)
    try {
      console.log('Fetching toy info for:', toyQuery)
      const response = await fetch('/api/perplexity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: "llama-3.1-sonar-small-128k-online",
          messages: [
            { role: 'system', content: 'You are a helpful assistant that provides information about toys.' },
            { role: 'user', content: `Provide detailed information about the toy: ${toyQuery}. Include name, image URL, price on Amazon and Target, description, age range, cognitive skills it develops, and average review score with review count. Format the response as JSON with keys: name, imageUrl, price (with nested amazon and target), description, ageRange, cognitiveSkills (as an array), and reviews (with nested average and count). Do not include any comments in the JSON. Ensure the JSON is valid and complete. Use null for any missing information.` }
          ]
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('API response not ok:', response.status, errorText)
        throw new Error(`API response not ok: ${response.status} ${errorText}`)
      }

      const data = await response.json()
      console.log('API response:', data)
      
      // Extract the JSON string from the message content
      const jsonString = data.choices[0].message.content.match(/```json\n([\s\S]*?)\n```/)?.[1] || data.choices[0].message.content
      if (!jsonString) {
        throw new Error('Failed to extract JSON from API response')
      }

      console.log('Extracted JSON string:', jsonString)

      // Remove any potential comments and control characters from the JSON string
      const cleanJsonString = jsonString
        .replace(/\/\/.*$/gm, '')
        .replace(/[\x00-\x1F\x7F-\x9F]/g, '')
        .replace(/\n/g, '')
        .replace(/\s+/g, ' ')
        .trim()

      console.log('Cleaned JSON string:', cleanJsonString)

      // Parse the cleaned JSON string
      const parsedInfo: ToyInfo = JSON.parse(cleanJsonString)
      
      // Ensure imageUrl is complete or null
      if (parsedInfo.imageUrl && !parsedInfo.imageUrl.startsWith('http')) {
        parsedInfo.imageUrl = `https:${parsedInfo.imageUrl}`
      } else if (!parsedInfo.imageUrl) {
        parsedInfo.imageUrl = null
      }

      console.log('Parsed toy info:', parsedInfo)

      setToyInfo(parsedInfo)
      console.log('Toy info state set')
    } catch (error) {
      console.error('Error fetching toy information:', error)
      setError('Failed to fetch toy information. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (toyQuery) {
      fetchToyInfo()
    }
  }

  const formatPrice = (price: string | number | null): string => {
    if (price === null) return 'N/A'
    if (typeof price === 'string') {
      // Remove any non-numeric characters except for the decimal point
      const numericPrice = price.replace(/[^\d.]/g, '')
      const parsedPrice = parseFloat(numericPrice)
      return isNaN(parsedPrice) ? price : `$${parsedPrice.toFixed(2)}`
    }
    if (typeof price === 'number') {
      return `$${price.toFixed(2)}`
    }
    return 'N/A'
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Toy Search</h1>
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="flex gap-2">
          <Input
            type="text"
            value={toyQuery}
            onChange={(e) => setToyQuery(e.target.value)}
            placeholder="Enter toy name"
            className="flex-grow"
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Search'}
          </Button>
        </div>
      </form>

      {error && (
        <div className="text-red-500 mb-4">{error}</div>
      )}

      {toyInfo && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>{toyInfo.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {toyInfo.imageUrl ? (
              <div className="flex justify-center">
                <Image
                  src={toyInfo.imageUrl}
                  alt={toyInfo.name}
                  width={300}
                  height={300}
                  className="rounded-lg"
                />
              </div>
            ) : (
              <div className="flex justify-center items-center h-[300px] bg-gray-200 rounded-lg">
                <p className="text-gray-500">No image available</p>
              </div>
            )}
            <p><strong>Price:</strong> 
              Amazon: {formatPrice(toyInfo.price.amazon)}, 
              Target: {formatPrice(toyInfo.price.target)}
            </p>
            <p><strong>Description:</strong> {toyInfo.description}</p>
            <p><strong>Age Range:</strong> {toyInfo.ageRange}</p>
            <p><strong>Cognitive Skills:</strong> {toyInfo.cognitiveSkills.join(', ')}</p>
            <p><strong>Reviews:</strong> 
              {toyInfo.reviews.average !== null ? `${toyInfo.reviews.average.toFixed(1)}/5` : 'N/A'} 
              ({toyInfo.reviews.count !== null ? `${toyInfo.reviews.count} reviews` : 'N/A'})
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}