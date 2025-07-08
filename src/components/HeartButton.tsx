import { Button } from '@/components/ui/button'
import { Heart } from 'lucide-react'
import { useFavorite } from '@/hooks/useFavorites'

interface HeartButtonProps {
  source_table?: string | null
  id: string
  ai_headline?: string | null
  headline?: string
}

export default function HeartButton({
  source_table,
  id,
  ai_headline,
  headline,
}: HeartButtonProps) {
  const snapshot =
    id && ai_headline != null && headline
      ? { ai_headline, headline }
      : undefined

  const { isFavorite, toggleFavorite, loading } = useFavorite(
    source_table,
    id,
    snapshot
  )

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleFavorite}
      disabled={loading || !id}
      className={isFavorite ? 'text-red-500' : 'text-gray-400'}
    >
      <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
    </Button>
  )
}
