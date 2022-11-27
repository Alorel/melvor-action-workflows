import {useCallback} from 'preact/hooks';
import {useNodeValidationCtx} from '../ui/components/workflow-editor/render-node-option/node-option-validation-ctx';

/** Return a callback for marking the field as touched */
export function useRenderEditTouch(): () => void {
  const {touched} = useNodeValidationCtx();

  return useCallback(() => {
    touched.value = true;
  }, [touched]);
}
