import { useState, useEffect, useCallback } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/hooks/useAuth"

export interface TopHeadline {
  source_id: string
  headline: string
  week: number
  year: number
  frequency: number
  ai_headline: string | null
  id: string | null
}

export function useTopHeadlines(
  week: number | null,
  year: number | null
) {
  const [items, setItems] = useState<TopHeadline[]>([])
  const [loading, setLoading] = useState(true)
  const [numOverrides, setNumOverrides] = useState<number>(0)
  const { session } = useAuth()
  const user = session?.user.id

  const fetchHeadlines = useCallback(async () => {
    if (week == null || year == null || !user) return
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("topWeeklyAIHeadlines")
        .select("source_id, headline, frequency, ai_headline, week, year, id")
        .eq("week", week)
        .eq("year", year)
        .order("frequency", { ascending: false })

      if (error) throw error

      const { data: overrides, error: oErr } = await supabase
          .from("userTopHeadlines")
          .select("source_id, headline, frequency, ai_headline, week, year, id")
          .eq("week", week)
          .eq("year", year)
          .eq("user", user)
        if (oErr) throw oErr
        const numOverrides = overrides.length

        const overrideMap = new Map<string, {ai_headline: string, id: string}>()
        overrides?.forEach((o) => {
          if (o.ai_headline) overrideMap.set(o.source_id, {ai_headline: o.ai_headline, id: o.id})
        })

        const merged = data!.map(r => {
          const ov = overrideMap.get(r.source_id)
          return {
            ...r,
            ai_headline: ov?.ai_headline ?? r.ai_headline,
            id:          ov?.id           ?? r.id   // prefer override.id, else the original
          }
        })
      
      setItems(merged)
      setNumOverrides(numOverrides)
    } catch (e) {
      console.error("Error loading Top AI Headlines:", e)
    } finally {
      setLoading(false)
    }
  }, [week, year])

  useEffect(() => {
    fetchHeadlines()
  }, [fetchHeadlines])

  return {
    items,
    loading,
    refetch: fetchHeadlines,
    numOverrides
  }
}
