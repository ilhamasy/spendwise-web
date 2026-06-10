'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth'
import mockupImage from '@/assets/mockup-device-dashboard.png'
import AuthModal from '@/components/AuthModal'

export default function LandingPage() {
  const { user, isLoading } = useAuth()
  const [showAuth, setShowAuth] = useState(false)

  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-white">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-violet-600" />
      </div>
    )
  }

  if (user) return null

  return (
    <div className="min-h-screen w-full bg-white relative overflow-x-hidden">
      {/* Background grid + radial purple glow */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, #f0f0f0 1px, transparent 1px),
            linear-gradient(to bottom, #f0f0f0 1px, transparent 1px),
            radial-gradient(circle 800px at 0% 200px, #d5c5ff, transparent)
          `,
          backgroundSize: '96px 64px, 96px 64px, 100% 100%',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12 lg:py-20">
        {/* Hero Section */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column — Hero Content */}
          <div className="space-y-6">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold font-sans text-slate-900 tracking-tight">
              SpendWise
            </h1>
            <p className="text-xl sm:text-2xl text-slate-600 font-medium">
              Track every Rupiah. Spend Smarter
            </p>
            <p className="text-base text-slate-500 max-w-md">
              Everywhere, Every Device, No need to download app, just access it.
            </p>
            <button
              onClick={() => setShowAuth(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-violet-500/25 transition-all hover:from-violet-700 hover:to-indigo-700 hover:shadow-xl hover:shadow-violet-500/30 hover:scale-[1.02] active:scale-[0.98]"
            >
              Get Started
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
            </button>
          </div>

          {/* Right Column — Device Mockup */}
          <div className="flex justify-center lg:justify-end">
            {/* Insert generated device mockup image here */}
            <img
              src={mockupImage.src}
              alt="SpendWise Dashboard on MacBook, iPad, and iPhone"
              className="w-full max-w-lg lg:max-w-xl drop-shadow-2xl"
            />
          </div>
        </div>

        {/* Feature Grid Section */}
        <div className="mt-20 lg:mt-28">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Everything you need to manage your finances
            </h2>
            <p className="mt-3 text-slate-500 text-base">
              Powerful features to track, budget, and grow your money.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Moneytory Card */}
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-sm font-semibold text-slate-900 mb-4">Moneytory</h3>
              <div className="flex items-center gap-4">
                <div className="relative h-20 w-20 flex-shrink-0">
                  <svg viewBox="0 0 36 36" className="h-20 w-20 -rotate-90">
                    <circle cx="18" cy="18" r="14" fill="none" stroke="#f1f5f9" strokeWidth="6" />
                    <circle cx="18" cy="18" r="14" fill="none" stroke="#8b5cf6" strokeWidth="6" strokeDasharray="38 50" strokeLinecap="round" />
                    <circle cx="18" cy="18" r="14" fill="none" stroke="#3b82f6" strokeWidth="6" strokeDasharray="17 71" strokeLinecap="round" strokeDashoffset="-38" />
                    <circle cx="18" cy="18" r="14" fill="none" stroke="#ef4444" strokeWidth="6" strokeDasharray="12 76" strokeLinecap="round" strokeDashoffset="-55" />
                    <circle cx="18" cy="18" r="14" fill="none" stroke="#10b981" strokeWidth="6" strokeDasharray="17 71" strokeLinecap="round" strokeDashoffset="-67" />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-slate-700">44%</span>
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-violet-500" /> Saving 44%</div>
                  <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-blue-500" /> Bills 19%</div>
                  <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-red-400" /> Ngopi 14%</div>
                  <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-emerald-400" /> Beverage 20%</div>
                </div>
              </div>
            </div>

            {/* Budget Card */}
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-sm font-semibold text-slate-900 mb-4">Budget</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs text-slate-600 mb-1">
                    <span>Ngopi</span>
                    <span className="font-medium">50%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100">
                    <div className="h-2 rounded-full bg-gradient-to-r from-violet-500 to-indigo-500" style={{ width: '50%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs text-slate-600 mb-1">
                    <span>Bensin</span>
                    <span className="font-medium">20%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100">
                    <div className="h-2 rounded-full bg-gradient-to-r from-amber-400 to-orange-400" style={{ width: '20%' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Saving Goals Card */}
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-sm font-semibold text-slate-900 mb-4">Saving Goals</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs text-slate-600 mb-1">
                    <span className="font-medium">MacBook M5</span>
                    <span>75%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100">
                    <div className="h-2 rounded-full bg-gradient-to-r from-violet-500 to-purple-500" style={{ width: '75%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs text-slate-600 mb-1">
                    <span className="font-medium">Haji</span>
                    <span>30%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100">
                    <div className="h-2 rounded-full bg-gradient-to-r from-emerald-400 to-teal-400" style={{ width: '30%' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Transactions Card */}
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-sm font-semibold text-slate-900 mb-4">Recent Transactions</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50 text-sm">☕</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">Ngopi</p>
                    <p className="text-xs text-slate-400">Today</p>
                  </div>
                  <span className="text-sm font-semibold text-red-500 whitespace-nowrap">-Rp 20.000</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-sm">💰</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">Gaji</p>
                    <p className="text-xs text-slate-400">Yesterday</p>
                  </div>
                  <span className="text-sm font-semibold text-emerald-500 whitespace-nowrap">+Rp 10.000.000</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-sm">🥤</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">Beverage</p>
                    <p className="text-xs text-slate-400">2 days ago</p>
                  </div>
                  <span className="text-sm font-semibold text-red-500 whitespace-nowrap">-Rp 70.000</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-sm">🎬</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">Netflix & Chill</p>
                    <p className="text-xs text-slate-400">3 days ago</p>
                  </div>
                  <span className="text-sm font-semibold text-red-500 whitespace-nowrap">-Rp 65.000</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AuthModal open={showAuth} onClose={() => setShowAuth(false)} />
    </div>
  )
}
