import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/hooks/useAuth'

export function useFavorite(
  source_table: string,
  id: string,
  snapshot?: { ai_headline: string; headline: string }
) {
  const [isFavorite, setIsFavorite] = useState(false)
  const [loading, setLoading] = useState(false)
  const { session } = useAuth()
  const user = session?.user.id

  useEffect(() => {
    if (!user) return
    let cancelled = false
    supabase
      .from('favorites')
      .select('id')
      .eq('id', id)
      .eq('user', user)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!cancelled) {
          if (error && error.code !== 'PGRST116') console.error(error)
          setIsFavorite(!!data)
        }
      })
    return () => { cancelled = true }
  }, [source_table, id, user])

  const toggleFavorite = useCallback(async () => {
    if (!snapshot || !user) {
      console.warn('Nothing to store OR No User ID')
      return
    }
    setLoading(true)
    try {
      if (isFavorite) {
        await supabase
          .from('favorites')
          .delete()
          .eq('source_table', source_table)
          .eq('id', id)
          .eq('user', user)
      } else {
        await supabase
          .from('favorites')
          .insert({
            user: user,
            source_table: source_table,
            id: id,
            ai_headline: snapshot.ai_headline,
            headline: snapshot.headline
          })
      }
      setIsFavorite(!isFavorite)
    } catch (err) {
      console.error('Favorite toggle failed:', err)
    } finally {
      setLoading(false)
    }
  }, [source_table, id, isFavorite, snapshot, user])

  return { isFavorite, toggleFavorite, loading }
}
