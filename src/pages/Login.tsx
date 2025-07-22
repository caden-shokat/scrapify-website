import { cn } from '@/lib/utils'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/integrations/supabase/client'
import { Button } from '@/components/ui/button'
import { Github, Info, Container } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card'
import HelpButton from '@/components/HelpButton'
import { useState } from 'react'

export default function LoginForm({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const { session } = useAuth()
  const navigate = useNavigate()

   useEffect(() => {
    if (session) {
      navigate('/', { replace: true })
    }
  }, [session, navigate])

  const handleSocialLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `https://cadenshokat.github.io/scrapify-website/`,
          //redirectTo: `${window.location.origin}/api/auth/callback`,   **  use for local dev
        }
      })

      if (error) throw error
      //location.href = '/protected'
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred')
      setIsLoading(false)
    }
  }


  return (
    <div className={cn('flex min-h-screen items-center justify-center', 'bg-[#fafafa]', 'bg-[radial-gradient(#cbd5e1_1px,transparent_1px)]', 'bg-[length:20px_20px]', className)} {...props}>
      <header className="absolute top-0 left-2 right-0 h-16 flex items-center px-6">
        {/* Logo at top‑left */}
        <div className="flex-1 mt-2">
          <img
            src={`${import.meta.env.BASE_URL}hearcom.svg`}
            alt="Hear.com"
            className="h-10"
          />
        </div>

        {/* Buttons at top‑right */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => window.open("https://github.com/cadenshokat/scrapify-website", "_blank")}
          >
            <Github className="h-10 w-10" />
          </Button>
          <HelpButton />
        </div>
      </header>

      <div className="w-full max-w-xl p-24">
          
        <div className="flex items-center justify-center mb-2">
          <img
              src={`${import.meta.env.BASE_URL}scrapify.png`}
              alt="Logo"
              className="h-30 w-80"
            />
            
        </div>
        <div className="flex flex-col justify-center items-center border border-gray-200 rounded-lg shadow-md p-8 bg-[#ffffff]">
          <div className={cn("text-2xl flex font-semibold leading-none tracking-tight mb-2 text-gray-800", className)}>
            Welcome Back
          </div>
          <div className={cn("text-sm text-muted-foreground mb-4", className)}>
            Sign in with your company Google account
          </div>
          <div className="flex flex-col gap-4 items-center ">
                  <Button variant="outline" className="w-60 bg-white shadow-sm" onClick={handleSocialLogin}>
                    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" aria-label="Google">
                      <title>Google “G”</title>
                      <clipPath id="g">
                        <path
                          d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z"
                        />
                      </clipPath>
                      <g clip-path="url(#g)">
                        <path fill="#FBBC05" d="M0 37V11l17 13z" />
                        <path fill="#EA4335" d="M0 11l17 13 7-6.1L48 14V0H0z" />
                        <path fill="#34A853" d="M0 37l30-23 7.9 1L48 0v48H0z" />
                        <path fill="#4285F4" d="M48 48L17 24l-4-3 35-10z" />
                      </g>
                    </svg>
                    Login with Google
                  </Button>
          </div>
        </div>
      
        <div className="flex items-center justify-center mt-6">
          
        </div>
      </div>
    </div>
  )
}
