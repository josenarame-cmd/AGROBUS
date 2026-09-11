import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function fmt(n: number | undefined | null, currency = true) {
  const val = n ?? 0;
  if (currency) {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency', currency: 'RWF', maximumFractionDigits: 0,
    }).format(val);
  }
  return new Intl.NumberFormat().format(val);
}

export function fmtDate(d: string | undefined | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-RW', { dateStyle: 'medium' });
}

export function fmtDateTime(d: string | undefined | null) {
  if (!d) return '—';
  return new Date(d).toLocaleString('en-RW', { dateStyle: 'medium', timeStyle: 'short' });
}
