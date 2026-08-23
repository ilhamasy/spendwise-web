export function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(' ')
}

export function generateId(): string {
  return crypto.randomUUID()
}

export function sanitizeInput(input: string): string {
  if (!input) return ''
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}

export function isValidFinancialAmount(amount: number): boolean {
  if (typeof amount !== 'number' || isNaN(amount)) return false
  return amount > 0 && amount <= 1000000000000
}

export function isFutureOrToday(dateString: string): boolean {
  if (!dateString) return false
  const targetDate = new Date(dateString)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  targetDate.setHours(0, 0, 0, 0)
  return targetDate >= today
}
