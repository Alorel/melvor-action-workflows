const _t = typeof 1;
type TypeOfStr = typeof _t;

export function isUndefinedOr(value: any, ty: TypeOfStr): boolean {
  return value === undefined || typeof value === ty;
}
