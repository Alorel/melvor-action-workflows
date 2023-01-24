export function objectFromArray<T extends string>(values: T[]): Record<T, T> {
  const out: Record<T, T> = {} as any;
  for (const v of values) {
    out[v] = v;
  }

  return out;
}
