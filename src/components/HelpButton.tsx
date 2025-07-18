import { Button } from '@/components/ui/button'
import { Info } from 'lucide-react'

export default function LogoutButton() {
  const handleClick = () => {
    window.open('https://audibene-my.sharepoint.com/:w:/g/personal/alisha_chaudhuri_hear_com/EUXJj-4SSSZApUuZxNvwtX8BopDzRJFjR4G5ZX_51BoEaA?e=qaiP7n', '_blank')
  }
  
  return (
    <Button variant="ghost" className="rounded-full" onClick={handleClick}>
      <Info />
    </Button>
  )
}