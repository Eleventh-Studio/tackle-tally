import type { LengthUnit, WeightUnit } from '@/stores/useSettingsStore';

const CM_PER_INCH = 2.54;
const G_PER_LB = 453.592;

/** Convert a stored cm value into the display unit. */
export function lengthFromCm(cm: number, unit: LengthUnit): number {
  return unit === 'cm' ? cm : cm / CM_PER_INCH;
}

/** Convert a user-entered value (in `unit`) back to cm for storage. */
export function lengthToCm(value: number, unit: LengthUnit): number {
  return unit === 'cm' ? value : value * CM_PER_INCH;
}

/** Convert a stored grams value into the display unit. */
export function weightFromG(g: number, unit: WeightUnit): number {
  return unit === 'kg' ? g / 1000 : g / G_PER_LB;
}

/** Convert a user-entered value (in `unit`) back to grams for storage. */
export function weightToG(value: number, unit: WeightUnit): number {
  return unit === 'kg' ? value * 1000 : value * G_PER_LB;
}

/** "42 cm" or "1.2 kg · 18 in" — null/0 inputs return empty parts. */
export function formatSize(
  lengthCm: number | null | undefined,
  weightG: number | null | undefined,
  lengthUnit: LengthUnit,
  weightUnit: WeightUnit
): string {
  const parts: string[] = [];
  if (lengthCm) {
    const v = lengthFromCm(lengthCm, lengthUnit);
    parts.push(`${lengthUnit === 'cm' ? Math.round(v) : v.toFixed(1)} ${lengthUnit}`);
  }
  if (weightG) {
    const v = weightFromG(weightG, weightUnit);
    parts.push(`${v.toFixed(1)} ${weightUnit}`);
  }
  return parts.join(' · ');
}
