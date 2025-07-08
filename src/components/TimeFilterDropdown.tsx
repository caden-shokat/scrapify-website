
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface TimeFilterDropdownProps {
  value: 'daily' | 'weekly' | 'monthly'
  onValueChange: (value: 'daily' | 'weekly' | 'monthly') => void
}

const TimeFilterDropdown = ({ value, onValueChange }: TimeFilterDropdownProps) => {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-32">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="daily">Daily</SelectItem>
        <SelectItem value="weekly">Weekly</SelectItem>
        <SelectItem value="monthly">Monthly</SelectItem>
      </SelectContent>
    </Select>
  )
}

export default TimeFilterDropdown
