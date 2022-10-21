export function defineProp<T extends object, K extends keyof T>(obj: T, key: K, value: T[K], enumerable = true): T[K] {
  Object.defineProperty(obj, key, {
    enumerable,
    value,
  });

  return value;
}
