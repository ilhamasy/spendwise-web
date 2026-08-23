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

export function validatePasswordStrength(password: string): { valid: boolean; message?: string } {
  if (!password || password.trim().length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long' }
  }
  const weakList = ['12345678', 'password', 'admin123', 'spendwise', 'qwertyui']
  if (weakList.includes(password.trim().toLowerCase())) {
    return { valid: false, message: 'Password is too common or weak' }
  }
  return { valid: true }
}
