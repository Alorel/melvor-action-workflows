import {useCallback, useState} from 'preact/hooks';

export default function useReRender(): () => void {
  const setValue = useState(Number.MIN_VALUE)[1];

  return useCallback(() => {
    setValue(val => val + 1);
  }, []);
}
