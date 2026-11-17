import { z } from 'zod';

export const SKIN_TYPES = ['oily', 'dry', 'combination', 'normal', 'sensitive', 'not sure'] as const;
export const CONCERNS = ['acne', 'dark spots', 'dullness', 'dryness', 'oiliness', 'redness', 'sensitivity', 'tanning'] as const;

export const profileSchema = z.object({
  name: z.string().trim().min(1).max(60),
  age: z.number().int().min(10).max(100),
  skinType: z.enum(SKIN_TYPES),
  concerns: z.array(z.enum(CONCERNS)).max(8),
  allergies: z.string().trim().max(200),
  budget: z.enum(['under ₹300', '₹300–₹800', '₹800+']),
  products: z.array(z.string().trim().min(1).max(80)).max(20).default([]),
  cycle: z.object({
    lastPeriodStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    cycleLength: z.number().int().min(21).max(40),
  }).nullable().default(null),
});
export type SkinProfile = z.infer<typeof profileSchema>;

export type Consent = { acceptedAt: string; guardianConfirmed: boolean };

/** Under-18 users need a guardian to confirm before photos are analysed. */
export function photoAllowed(profile: SkinProfile | null, consent: Consent | null) {
  if (!profile || !consent) return false;
  return profile.age >= 18 || consent.guardianConfirmed;
}

/** Cycle dates never leave the browser: strip them before any request. */
export const withoutCycleDates = (profile: SkinProfile): SkinProfile => ({ ...profile, cycle: null });

export const CYCLE_PHASES = ['menstrual', 'follicular', 'ovulatory', 'luteal'] as const;
export type CyclePhase = (typeof CYCLE_PHASES)[number];
export type CycleInfo = { phase: CyclePhase; day: number; length: number };

const DAY_MS = 86_400_000;

/** Where the person is in their cycle today, estimated from the last period start. Null if the date is missing or in the future. */
export function currentCycle(cycle: SkinProfile['cycle'], today = new Date()): CycleInfo | null {
  if (!cycle) return null;
  const [year = 0, month = 1, date = 1] = cycle.lastPeriodStart.split('-').map(Number);
  const start = Date.UTC(year, month - 1, date);
  const now = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  if (Number.isNaN(start) || start > now) return null;
  const length = cycle.cycleLength;
  const day = Math.floor((now - start) / DAY_MS) % length + 1;
  const ovulation = Math.max(8, length - 14);
  const phase: CyclePhase = day <= 5 ? 'menstrual' : day < ovulation - 1 ? 'follicular' : day <= ovulation + 1 ? 'ovulatory' : 'luteal';
  return { phase, day, length };
}
