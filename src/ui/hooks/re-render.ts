import {useCallback, useState} from 'preact/hooks';
import {EMPTY_ARR} from '../../lib/util.mjs';

export default function useReRender(): () => void {
  const setValue = useState(0)[1];

  return useCallback(() => {
    setValue(inc);
  }, EMPTY_ARR);
}

function inc(v: number): number {
  return v + 1;
}
