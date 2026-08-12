import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import LandingPage from '@/components/LandingPage'

export default async function Home() {
  const cookieStore = await cookies()
  const token =
    cookieStore.get('spendwise-access-token')?.value ||
    cookieStore.get('spendwise-token')?.value ||
    cookieStore.get('spendwise-session')?.value
  if (token) {
    redirect('/dashboard')
  }

  return <LandingPage />
}
