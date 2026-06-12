import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import LandingPage from '@/components/LandingPage'

export default async function NotFound() {
  const cookieStore = await cookies()
  const token = cookieStore.get('spendwise-token')?.value
  if (token) {
    redirect('/dashboard')
  }
  return <LandingPage />
}
