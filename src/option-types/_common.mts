import {useCallback} from 'preact/hooks';
import {useNodeValidationCtx} from '../ui/components/workflow-editor/render-node-option/node-option-validation-ctx';

export function useRenderEditTouch(): () => void {
  const {touched} = useNodeValidationCtx();

  return useCallback(() => {
    touched.value = true;
  }, [touched]);
}
