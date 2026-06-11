'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import mockupImage from '@/assets/mockup-device.png'
import AuthModal from '@/components/AuthModal'

const MONEYTORY_DATA = [
  { name: 'Saving', value: 44, color: '#8b5cf6' },
  { name: 'Bills', value: 19, color: '#3b82f6' },
  { name: 'Ngopi', value: 14, color: '#ef4444' },
  { name: 'Beverage', value: 20, color: '#10b981' },
  { name: 'Other', value: 3, color: '#9ca3af' },
]

const ANIMATED_WORDS = [
  'Track every Rupiah. Spend Smarter',
  'Everywhere, Every Device, No need to download app, just access it.',
]

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

  const total = MONEYTORY_DATA.reduce((s, d) => s + d.value, 0)

  return (
    <div className="min-h-screen w-full bg-white relative overflow-x-hidden">
      {/* Background grid + radial purple glow */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, #f0f0f0 1px, transparent 1px),
            linear-gradient(to bottom, #f0f0f0 1px, transparent 1px),
            radial-gradient(circle 800px at 0% 200px, #d5c5ff, transparent)
          `,
          backgroundSize: '96px 64px, 96px 64px, 100% 100%',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 lg:py-20">
        {/* Hero Section */}
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
          {/* Left Column — Hero Content */}
          <div className="space-y-4 sm:space-y-6 text-center lg:text-left">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold font-sans text-slate-900 tracking-tight">
              SpendWise
            </h1>
            <p className="text-lg sm:text-xl lg:text-2xl text-slate-600 font-medium min-h-[2em]">
              <TypingAnimation words={ANIMATED_WORDS} loop />
            </p>
            <button
              onClick={() => setShowAuth(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 sm:px-8 py-3 sm:py-3.5 text-sm sm:text-base font-semibold text-white shadow-lg shadow-violet-500/25 transition-all hover:from-violet-700 hover:to-indigo-700 hover:shadow-xl hover:shadow-violet-500/30 hover:scale-[1.02] active:scale-[0.98]"
            >
              Coba aja dulu, Gratis
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
            </button>
          </div>

          {/* Right Column — Device Mockup */}
          <div className="flex justify-center lg:justify-end">
            <img
              src={mockupImage.src}
              alt="SpendWise Dashboard on MacBook, iPad, and iPhone"
              className="w-full max-w-md sm:max-w-lg lg:max-w-xl"
            />
          </div>
        </div>

        {/* Feature Grid Section */}
        <div className="mt-16 sm:mt-20 lg:mt-28">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900">
              Everything you need to manage your finances
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Moneytory Card — using Recharts PieChart */}
            <div className="rounded-2xl border border-slate-100 bg-white p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-sm font-semibold text-slate-900 mb-3 sm:mb-4">Moneytory</h3>
              <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
                <div className="relative h-24 w-24 sm:h-20 sm:w-20 flex-shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={MONEYTORY_DATA}
                        cx="50%"
                        cy="50%"
                        innerRadius={28}
                        outerRadius={40}
                        dataKey="value"
                        strokeWidth={0}
                      >
                        {MONEYTORY_DATA.map((entry, i) => (
                          <Cell key={`cell-${i}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-slate-700">
                    {MONEYTORY_DATA[0].value}%
                  </span>
                </div>
                <div className="space-y-1 text-xs w-full">
                  {MONEYTORY_DATA.slice(0, 4).map((item) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                        <span className="text-slate-600">{item.name}</span>
                      </div>
                      <span className="font-medium text-slate-700">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Budget Card */}
            <div className="rounded-2xl border border-slate-100 bg-white p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-sm font-semibold text-slate-900 mb-3 sm:mb-4">Budget</h3>
              <div className="space-y-3 sm:space-y-4">
                {[
                  { name: 'Ngopi', pct: 50, color: 'from-violet-500 to-indigo-500' },
                  { name: 'Bensin', pct: 20, color: 'from-amber-400 to-orange-400' },
                ].map((item) => (
                  <div key={item.name}>
                    <div className="flex justify-between text-xs text-slate-600 mb-1">
                      <span>{item.name}</span>
                      <span className="font-medium">{item.pct}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100">
                      <div className={`h-2 rounded-full bg-gradient-to-r ${item.color}`} style={{ width: `${item.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Saving Goals Card */}
            <div className="rounded-2xl border border-slate-100 bg-white p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-sm font-semibold text-slate-900 mb-3 sm:mb-4">Saving Goals</h3>
              <div className="space-y-3 sm:space-y-4">
                {[
                  { name: 'MacBook M5', pct: 75, color: 'from-violet-500 to-purple-500' },
                  { name: 'Haji', pct: 30, color: 'from-emerald-400 to-teal-400' },
                ].map((item) => (
                  <div key={item.name}>
                    <div className="flex justify-between text-xs text-slate-600 mb-1">
                      <span className="font-medium">{item.name}</span>
                      <span>{item.pct}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100">
                      <div className={`h-2 rounded-full bg-gradient-to-r ${item.color}`} style={{ width: `${item.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Transactions Card */}
            <div className="rounded-2xl border border-slate-100 bg-white p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-sm font-semibold text-slate-900 mb-3 sm:mb-4">Recent Transactions</h3>
              <div className="space-y-2.5 sm:space-y-3">
                {[
                  { icon: '☕', name: 'Ngopi', date: 'Today', amount: '-Rp 20.000', color: 'red', bg: 'bg-violet-50' },
                  { icon: '💰', name: 'Gaji', date: 'Yesterday', amount: '+Rp 10.000.000', color: 'emerald', bg: 'bg-emerald-50' },
                  { icon: '🥤', name: 'Beverage', date: '2 days ago', amount: '-Rp 70.000', color: 'red', bg: 'bg-amber-50' },
                  { icon: '🎬', name: 'Netflix & Chill', date: '3 days ago', amount: '-Rp 65.000', color: 'red', bg: 'bg-red-50' },
                ].map((tx) => (
                  <div key={tx.name} className="flex items-center gap-2.5 sm:gap-3">
                    <span className={`flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg ${tx.bg} text-xs sm:text-sm flex-shrink-0`}>{tx.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-slate-700 truncate">{tx.name}</p>
                      <p className="text-[10px] sm:text-xs text-slate-400">{tx.date}</p>
                    </div>
                    <span className={`text-xs sm:text-sm font-semibold whitespace-nowrap ${tx.color === 'red' ? 'text-red-500' : 'text-emerald-500'}`}>{tx.amount}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-20 sm:mt-28 border-t border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-violet-600">SpendWise</span>
              </div>
              <div className="flex items-center gap-6 text-sm text-slate-500">
                <button onClick={() => setShowAuth(true)} className="hover:text-violet-600 transition-colors">Sign In</button>
                <span className="text-slate-300">|</span>
                <span>Track every Rupiah. Spend Smarter.</span>
              </div>
              <p className="text-xs text-slate-400">
                &copy; {new Date().getFullYear()} Ilham Asyari. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>

      <AuthModal open={showAuth} onClose={() => setShowAuth(false)} />
    </div>
  )
}

function TypingAnimation({ words, loop = false }: { words: string[]; loop?: boolean }) {
  const [wordIndex, setWordIndex] = useState(0)
  const [charIndex, setCharIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const currentWord = words[wordIndex]
    const typeSpeed = isDeleting ? 40 : 80
    const deleteSpeed = 30

    if (!isDeleting && charIndex === currentWord.length) {
      const pause = setTimeout(() => setIsDeleting(true), 2500)
      return () => clearTimeout(pause)
    }

    if (isDeleting && charIndex === 0) {
      setIsDeleting(false)
      if (wordIndex === words.length - 1) {
        if (loop) {
          setWordIndex(0)
        }
      } else {
        setWordIndex(wordIndex + 1)
      }
      return
    }

    const timeout = setTimeout(() => {
      setCharIndex(charIndex + (isDeleting ? -1 : 1))
    }, isDeleting ? deleteSpeed : typeSpeed)

    return () => clearTimeout(timeout)
  }, [charIndex, isDeleting, wordIndex, words, loop])

  return (
    <>
      {words[wordIndex].slice(0, charIndex)}
      <span className="animate-pulse text-violet-500">|</span>
    </>
  )
}
