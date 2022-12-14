import {useEffect, useState} from 'preact/hooks';
import type {BehaviorSubject} from 'rxjs';

export function useBehaviourSubject<T>(sbj: Pick<BehaviorSubject<T>, 'value' | 'subscribe'>): T {
  const [value, setValue] = useState(sbj.value);

  useEffect(() => {
    const sub = sbj.subscribe(setValue);
    return () => {
      sub.unsubscribe();
    };
  }, [sbj]);

  return value;
}
