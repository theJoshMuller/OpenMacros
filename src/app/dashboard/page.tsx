'use client'

import { useTranslation } from 'react-i18next'
import { Card, CardContent } from '@/components/ui/card'

export default function DashboardPage() {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen p-4">
      <Card className="max-w-2xl mx-auto">
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-semibold">{t('dashboard.title')}</h1>
            <p className="text-muted-foreground">Dashboard coming soon</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
