

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/integrations/supabase/client"
import { Check } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"

interface SelectButtonProps {
  headline: string
  sourceTable: string
  sourceId?: string
  brand?: string
  isSelected?: boolean
  onSelectionChange: () => void
}

const SelectButton = ({
  headline,
  sourceTable,
  sourceId,
  brand,
  isSelected,
  onSelectionChange,
}: SelectButtonProps) => {
  const [loading, setLoading] = useState(false)
  const { session } = useAuth()
  const user = session?.user.id

  const toggleSelection = async () => {
    setLoading(true)
    try {
      if (!user) throw new Error("Not Signed In")
      if (isSelected) {
        const { error } = await supabase
          .from("selected")
          .delete()
          .eq("source_id", sourceId)
          .eq("source_table", sourceTable)
          .eq("user", user)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from("selected")
          .insert({
            user: user,
            headline,
            source_table: sourceTable,
            source_id: sourceId,
            brand,
          })
        if (error) throw error
      }
      onSelectionChange()
    } catch (err) {
      console.error("Error toggling selection:", err)
    } finally {
      setLoading(false)
    }
  }


  return (
    <Button
      size="sm"
      variant={isSelected ? "default" : "outline"}
      onClick={toggleSelection}
      disabled={loading}
      className={isSelected ? "bg-primary text-white" : ""}
    >
      {isSelected && <Check className="w-4 h-4 mr-1" />}
      {isSelected ? "" : "Select"}
    </Button>
  )
}

export default SelectButton
