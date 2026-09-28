// Format an amount as Pakistani Rupees, e.g. 3000 -> "Rs. 3,000".
export function money(n: number): string {
  return 'Rs. ' + Math.round(n).toLocaleString('en-PK')
}
