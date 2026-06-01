export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function parseCurrencyInput(value: string): number {
  return Number(value.replace(/\D/g, '')) || 0
}

export function formatCurrencyInput(value: number): string {
  if (value === 0) return ''
  return value.toLocaleString('id-ID')
}
