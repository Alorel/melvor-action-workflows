import {isEqual} from 'lodash-es';

type This<T> = T extends (this: infer E) => any ? E : never;

/**
 * Returns the previously returned object if calling the function again yields the same output
 * @param fn The function
 * @param checkFn Function used for output equality checking
 */
export function memoOutput<T extends(...args: any[]) => any>(
  fn: T,
  checkFn: (a: ReturnType<T>, b: ReturnType<T>) => boolean = isEqual
): T {
  let prevReturn: ReturnType<T>;

  return function memoOutputFn(this: This<T>): ReturnType<T> {
    const out = fn.apply(this, arguments as unknown as Parameters<T>);
    if (checkFn(out, prevReturn)) {
      return prevReturn;
    }

    prevReturn = out;
    return out;
  } as T;
}
