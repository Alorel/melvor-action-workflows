import type {Ref} from 'preact/hooks';
import {useRef} from 'preact/hooks';

export default function useRefreshingRef<T>(value: T): Ref<T> {
  const out = useRef(value);
  out.current = value;

  return out;
}
