export const LURE_TYPES = ['Soft Plastic', 'Hard Body', 'Topwater', 'Jig', 'Bait', 'Fly'] as const;
export type LureType = (typeof LURE_TYPES)[number];

export const LINE_TYPES = ['Braid', 'Mono', 'Fluorocarbon'] as const;
export type LineType = (typeof LINE_TYPES)[number];

export const LINE_WEIGHTS = [
  '2lb', '4lb', '6lb', '8lb', '10lb', '12lb', '15lb', '20lb', '25lb', '30lb',
  '40lb', '50lb', '60lb', '80lb',
] as const;

export const MOOD_EMOJIS = ['😄', '😎', '😤', '🤔', '😴', '🎉', '💪', '🌧️', '🤙'] as const;
export type MoodEmoji = (typeof MOOD_EMOJIS)[number];
