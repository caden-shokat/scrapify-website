import { cn } from '@/lib/utils'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/integrations/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card'
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useState } from 'react'

export default function LoginForm({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

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
          redirectTo: window.location.origin + '/',
        }
      })

      if (error) throw error
      //location.href = '/protected'
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred')
      setIsLoading(false)
    }
  }

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setIsLoading(false)
    }
  }


  return (
    <div className={cn('flex min-h-screen items-center justify-center bg-gray-100', className)} {...props}>
      <div className="w-full max-w-xl p-12">
        <div className="flex items-center justify-center mb-6">
          <img
              src="../Scrapify_logo.png"
              alt="Logo"
              className="h-16 w-16 rounded-full border border-gray-200"
            />
        </div>
      <Card>
        <CardHeader className="flex justify-center items-center">
          <CardTitle className="flex items-center gap-4 text-3xl">
            Welcome to Scrapify
          </CardTitle>
          <CardDescription>hear.com Internal Access Only</CardDescription>
        </CardHeader>
        <CardContent>
              <div className="flex flex-col gap-4">
                  <Button variant="default" className="w-full" onClick={handleSocialLogin}>
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
        </CardContent>
        <CardFooter className="flex flex-col justify-center items-center">
          <div className="mb-1">
            This is an internal company tool.
          </div>
          <div  className="text-sm text-gray-500 mb-2">
            You must use your hear.com Google account to access.
          </div>
        </CardFooter>
      </Card>
      </div>
    </div>
  )
}
