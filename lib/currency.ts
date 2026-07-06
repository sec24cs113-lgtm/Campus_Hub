export const USD_TO_INR_RATE = 83;

export function usdToInr(usd: number): number {
  return Math.round(usd * USD_TO_INR_RATE * 100) / 100;
}

export function formatInr(usd: number): string {
  const inr = usdToInr(usd);
  return `₹${inr.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
