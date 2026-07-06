import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const USD_TO_INR_RATE = 83;

export function formatINR(usd: number): string {
  const inr = Math.round(usd * USD_TO_INR_RATE);
  return `₹${inr.toLocaleString('en-IN')}`;
}
