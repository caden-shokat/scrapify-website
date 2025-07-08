import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/hooks/useAuth"

interface SelectedHeadline {
  id: string
  headline: string
  source_table: string
  source_id: string
  brand: string | null
  selected_at: string
  ai_headline: string | null
}

export const useSelectedHeadlines = () => {
  const [selectedHeadlines, setSelectedHeadlines] = useState<SelectedHeadline[]>([])
  const [loading, setLoading] = useState(true)
  const { session } = useAuth()
  const user = session?.user.id

  const fetchSelectedHeadlines = async () => {
    if (!user) return setLoading(false);
    try {
      const { data, error } = await supabase
        .from('selected')
        .select('id,headline,source_table,source_id,brand,selected_at,ai_headline')
        .eq("user", user)
        .order('selected_at', { ascending: false })

      if (error) throw error
      setSelectedHeadlines(data || [])
    } catch (error) {
      console.error('Error fetching selected headlines:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSelectedHeadlines()
  }, [user])

  return { selectedHeadlines, loading, refetch: fetchSelectedHeadlines }
}
