
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { supabase } from "@/integrations/supabase/client"
import { Eye, Image as ImageIcon, Sparkles } from "lucide-react"
import LoadingSpinner from "@/components/LoadingSpinner"

interface ImageData {
  Id: string
  "Image Url": string | null
  Headline: string | null
  Brand: string | null
  Platform: string | null
  aiDescription?: string
}

const ImageClassifier = () => {
  const [images, setImages] = useState<ImageData[]>([])
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  

  const fetchImages = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('Scrape Data')
        .select('Id, "Image Url", Headline, Brand, Platform')
        .not('Image Url', 'is', null)
        .order('Date', { ascending: false })
        .limit(20)

      if (error) throw error
      setImages(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
      fetchImages()
    }, [])

  const analyzeImage = async (imageId: string) => {
    setAnalyzing(prev => [...prev, imageId])
    
    setTimeout(() => {
      setImages(prev => prev.map(img => 
        img.Id === imageId 
          ? {
              ...img,
              aiDescription: "Professional business setting with modern technology elements. Features clean design with blue and white color scheme. Likely targeting corporate professionals and small business owners. High-quality stock photography with excellent composition and lighting."
            }
          : img
      ))
      setAnalyzing(prev => prev.filter(id => id !== imageId))
    }, 3000)
  }

  const getPlatformColor = (platform: string | null) => {
    if (!platform) return "bg-gray-100 text-gray-800"
    const colors: { [key: string]: string } = {
      MSN: "bg-blue-100 text-blue-800",
      Yahoo: "bg-purple-100 text-purple-800", 
      Fox: "bg-red-100 text-red-800",
      NBC: "bg-green-100 text-green-800",
      AOL: "bg-orange-100 text-orange-800"
    }
    return colors[platform] || "bg-gray-100 text-gray-800"
  }

  if (loading) return <LoadingSpinner />
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Image Classifier</h1>
      </div>

      {/* Stats */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4 text-sm">
            <Badge variant="outline">
              <ImageIcon className="w-3 h-3 mr-1" />
              {images.length} Images
            </Badge>
            <Badge variant="outline">
              <Sparkles className="w-3 h-3 mr-1" />
              {images.filter(img => img.aiDescription).length} Analyzed
            </Badge>
            <Badge variant="outline">Ready for Classification</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Images Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {images.map((image) => (
          <Card key={image.Id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="aspect-video bg-gray-100 relative">
              {image["Image Url"] ? (
                <img 
                  src={image["Image Url"]} 
                  alt="Ad image"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none'
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="w-12 h-12 text-gray-400" />
                </div>
              )}
              
              <div className="absolute top-2 right-2">
                <Badge className={getPlatformColor(image.Platform)}>
                  {image.Platform || 'Unknown'}
                </Badge>
              </div>
            </div>
            
            <CardContent className="p-4">
              <div className="space-y-3">
                <div>
                  <h3 className="font-medium text-gray-900 truncate" title={image.Headline}>
                    {image.Headline || 'No headline'}
                  </h3>
                  <p className="text-sm text-gray-500">{image.Brand || 'Unknown Brand'}</p>
                </div>
                
                {image.aiDescription && (
                  <div className="border-t pt-3">
                    <p className="text-sm text-green-600 mb-2 flex items-center gap-2">
                      <Eye className="w-3 h-3" />
                      AI Analysis:
                    </p>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {image.aiDescription}
                    </p>
                  </div>
                )}
                
                <div className="pt-2">
                  <Button 
                    onClick={() => analyzeImage(image.Id)}
                    disabled={analyzing.includes(image.Id) || !!image.aiDescription}
                    size="sm"
                    className="w-full bg-primary hover:bg-primary-light"
                  >
                    {analyzing.includes(image.Id) ? (
                      <>
                        <Sparkles className="w-3 h-3 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : image.aiDescription ? (
                      <>
                        <Eye className="w-3 h-3 mr-2" />
                        Analyzed
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3 h-3 mr-2" />
                        Analyze Image
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Refresh Button */}
      <div className="text-center">
        <Button variant="outline" onClick={fetchImages}>
          Load More Images
        </Button>
      </div>
    </div>
  )
}

export default ImageClassifier
