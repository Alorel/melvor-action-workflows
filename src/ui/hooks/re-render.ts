import {useCallback, useState} from 'preact/hooks';
import {isFalsy} from '../../lib/util.mjs';

export default function useReRender(): () => void {
  const setValue = useState(false)[1];

  return useCallback(() => {
    setValue(isFalsy);
  }, []);
}
