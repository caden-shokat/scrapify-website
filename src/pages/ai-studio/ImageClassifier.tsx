
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { supabase } from "@/integrations/supabase/client"
import { Eye, Image as ImageIcon, Sparkles } from "lucide-react"
import LoadingSpinner from "@/components/LoadingSpinner"
import { useRegion } from "@/hooks/useRegion"

interface ImageData {
  id: string
  image_url: string | null
  headline: string | null
  brand: string | null
  platform: string | null
  aiDescription?: string
}

const ImageClassifier = () => {
  const [images, setImages] = useState<ImageData[]>([])
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  const { region } = useRegion()
  const german = region == 'DE'

  const fetchImages = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('Scrape Data')
        .select('id, image_url, headline, brand, platform')
        .eq('region', region)
        .not('image_url', 'is', null)
        .order('date', { ascending: false })
        .limit(40)

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
        img.id === imageId 
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
    <div className="p-6 space-y-6 bg-[#fafafa] bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] bg-[length:20px_20px]">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{german ? 'Bildklassifizierer' : 'Image Classifier'}</h1>
      </div>

      {/* Stats */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4 text-sm">
            <Badge variant="outline">
              <ImageIcon className="w-3 h-3 mr-1" />
              {images.length} {german ? 'Bilder' : 'Images'}
            </Badge>
            <Badge variant="outline">
              <Sparkles className="w-3 h-3 mr-1" />
              {images.filter(img => img.aiDescription).length} {german ? 'Analysiert' : 'Analyzed'}
            </Badge>
            <Badge variant="outline">{german ? 'Bereit zur Klassifizierung' : 'Ready for Classification'}</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Images Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {images.map((image) => (
          <Card key={image.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="aspect-video bg-gray-100 relative">
              {image.image_url ? (
                <img 
                  src={image.image_url} 
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
                <Badge className={getPlatformColor(image.platform)}>
                  {image.platform || 'Unknown'}
                </Badge>
              </div>
            </div>
            
            <CardContent className="p-4">
              <div className="space-y-3">
                <div>
                  <h3 className="font-medium text-gray-900 truncate" title={image.headline}>
                    {image.headline || 'No headline'}
                  </h3>
                  <p className="text-sm text-gray-500">{image.brand || 'Unknown Brand'}</p>
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
                    onClick={() => analyzeImage(image.id)}
                    disabled={analyzing.includes(image.id) || !!image.aiDescription}
                    size="sm"
                    className="w-full bg-primary hover:bg-primary-light"
                  >
                    {analyzing.includes(image.id) ? (
                      <>
                        <Sparkles className="w-3 h-3 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : image.aiDescription ? (
                      <>
                        <Eye className="w-3 h-3 mr-2" />
                        {german ? 'Analysiert' : 'Analyzed'}
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3 h-3 mr-2" />
                        {german ? 'Bild analysieren' : 'Analyze Image'}
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
          {german ? 'Weitere Bilder laden' : 'Load More Images'}
        </Button>
      </div>
    </div>
  )
}

export default ImageClassifier
