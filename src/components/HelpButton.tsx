import { Button } from '@/components/ui/button'
import { Info } from 'lucide-react'

export default function LogoutButton() {
  const handleClick = () => {
    window.open('https://github.com/caden-shokat/Scrapify-US', '_blank')
  }
  
  return (
    <Button variant="outline" className="rounded-full" onClick={handleClick}>
      <Info />
    </Button>
  )
}