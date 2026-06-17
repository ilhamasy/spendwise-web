import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import LandingPage from '@/components/LandingPage'

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const cookieStore = await cookies()
  const token = cookieStore.get('spendwise-token')?.value
  if (token) {
    redirect('/dashboard')
  }

  const params = await searchParams
  if (params.code) {
    redirect(`/auth/google/callback?code=${params.code}`)
  }

  return <LandingPage />
}
