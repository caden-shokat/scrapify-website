import React from 'react'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import type { Region } from "@/hooks/useRegion"

interface SelectRegionProps {
  value: Region
  onValueChange: (value: Region) => void
}

const SelectRegion = ({
  value,
  onValueChange,
}: SelectRegionProps) => {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-24">
        <SelectValue placeholder="Region" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="US">🇺🇸 US</SelectItem>
        <SelectItem value="DE">🇩🇪 DE</SelectItem>
      </SelectContent>
    </Select>
  )
}

export default SelectRegion
