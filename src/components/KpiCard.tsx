'use client'

import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown } from 'lucide-react'
import type { StaticImageData } from 'next/image'

interface KpiCardProps {
  title: string
  value: string
  change: string
  isPositive: boolean
  icon: StaticImageData
}

export default function KpiCard({ title, value, change, isPositive, icon }: KpiCardProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-light">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={icon.src} alt={title} className="h-10 w-10" />
        </div>
        <span
          className={cn(
            'inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold',
            isPositive
              ? 'bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400'
              : 'bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400',
          )}
        >
          {isPositive ? (
            <TrendingUp className="h-3 w-3" />
          ) : (
            <TrendingDown className="h-3 w-3" />
          )}
          {change}
        </span>
      </div>
      <p className="mt-4 text-base font-bold text-foreground sm:text-2xl">{value}</p>
      <p className="mt-0.5 text-sm text-muted-foreground">{title}</p>
    </div>
  )
}
