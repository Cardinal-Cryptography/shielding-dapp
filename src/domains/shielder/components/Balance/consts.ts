export const BALANCE_TYPES_DATA = [
  { type: 'public', name: 'Public' },
  { type: 'shielded', name: 'Shielded' },
] as const;

export type BalanceType = typeof BALANCE_TYPES_DATA[number]['type'];
