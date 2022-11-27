import type {Obj} from '../../public_api';

type DynamicFn<T> = (values: Obj<any>) => T;

export type DynamicOption<T> = T | DynamicFn<T>;

/** Resolve a field definition option that can be provided either directly or via a dynamic function */
export function resolveDynamicOptionObject<T>(
  option: DynamicOption<T>,
  otherValues: Obj<any>
): T {
  return option == null
    ? option
    : typeof option === 'function'
      ? (option as DynamicFn<T>)(otherValues)
      : option;
}
