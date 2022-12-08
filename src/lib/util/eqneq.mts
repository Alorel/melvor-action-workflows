export const enum EqNeq {
  EQ = '=',
  NEQ = '!=',
}

type EqNeqFn<T> = (a: T, b: T) => boolean;

const compareFns = new Map<EqNeq, EqNeqFn<any>>([
  [EqNeq.EQ, (a, b) => a === b],
  [EqNeq.NEQ, (a, b) => a !== b],
]);

/** Get the comparison function for {@link EqNeq} */
export function getEqNeqFn<T>(eqNeq: EqNeq): EqNeqFn<T> {
  return compareFns.get(eqNeq)!;
}
