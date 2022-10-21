import {defineProp} from './define-prop.mjs';

export function lazyValue<T>(factory: () => T): {readonly value: T;} {
  const out = {
    get value(): T {
      return defineProp(out, 'value', factory());
    },
  };

  return out;
}
