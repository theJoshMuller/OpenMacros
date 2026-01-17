'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { useUserProfile } from '@/hooks/useUserProfile'
import { Card, CardContent } from '@/components/ui/card'

export default function Home() {
  const router = useRouter()
  const { getUserProfile } = useUserProfile()

  const [isChecking, setIsChecking] = React.useState(true)

  React.useEffect(() => {
    const checkProfile = async () => {
      try {
        const profile = await getUserProfile()
        if (profile) {
          router.push('/dashboard')
        } else {
          router.push('/onboarding')
        }
      } catch (err) {
        console.error('Error checking profile:', err)
        router.push('/onboarding')
      } finally {
        setIsChecking(false)
      }
    }

    checkProfile()
  }, [getUserProfile, router])

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-lg">
          <CardContent className="pt-6">
            <p className="text-center">Loading...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return null
}
