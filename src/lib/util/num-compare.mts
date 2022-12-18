export const enum NumComparator {
  GTE = '>=',
  LTE = '<=',
}

export const NUM_COMPARE_ENUM: Record<NumComparator, string> = {
  /* eslint-disable sort-keys */
  [NumComparator.GTE]: '≥',
  [NumComparator.LTE]: '≤',
  /* eslint-enable sort-keys */
};

export function numCompare(lhs: number, comp: NumComparator, rhs: number): boolean {
  return comp === NumComparator.GTE ? lhs >= rhs : lhs <= rhs;
}
