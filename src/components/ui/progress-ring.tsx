import * as React from 'react'
import { cn } from '@/lib/utils'

interface ProgressRingProps {
  size?: number
  strokeWidth?: number
  percentage: number
  label: string
  value: number
  target: number
  className?: string
}

export function ProgressRing({
  size = 80,
  strokeWidth = 6,
  percentage,
  label,
  value,
  target,
  className
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (percentage / 100) * circumference
  
  const isOver = percentage > 100
  const color = isOver ? 'stroke-destructive' : 'stroke-primary'

  return (
    <div className={cn('flex flex-col items-center gap-1', className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          className="transform -rotate-90"
        >
          <circle
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            r={radius}
            cx={size / 2}
            cy={size / 2}
            className="text-muted opacity-20"
          />
          <circle
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            r={radius}
            cx={size / 2}
            cy={size / 2}
            className={cn(color, 'transition-all duration-500 ease-out')}
            style={{
              strokeDasharray: circumference,
              strokeDashoffset: offset,
              strokeLinecap: 'round'
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn(
            'text-lg font-semibold',
            isOver ? 'text-destructive' : 'text-primary'
          )}>
            {percentage}%
          </span>
        </div>
      </div>
      <span className="text-sm font-medium">{label}</span>
      <span className="text-xs text-muted-foreground">
        {value} / {target}
      </span>
    </div>
  )
}
