export const EMPTY_OBJ: any = Object.freeze({});
export const EMPTY_ARR = Object.freeze<any[]>([]) as any[];

/** @return 1 if value is truthy, 0 if falsy */
export function boolNum(bool: any): 1 | 0 {
  return bool ? 1 : 0;
}
