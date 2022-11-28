import {Fragment} from 'preact';
import {useCallback} from 'preact/hooks';
import {defineOption} from '../lib/define-option.mjs';
import type {BooleanNodeOption} from '../public_api';
import {useNodeValidationCtx} from '../ui/components/workflow-editor/render-node-option/node-option-validation-ctx';
import {NodeOptionDesc} from '../ui/components/workflow-editor/render-node-option/render-node-option';

defineOption<boolean, BooleanNodeOption>({
  hasLabel: false,
  is: (v): v is BooleanNodeOption => v.type === Boolean,
  renderEdit({option: {description, label}, value = false, onChange}) {
    const {touched} = useNodeValidationCtx();
    const onInpChange = useCallback((e: Event) => {
      onChange((e.target as HTMLInputElement).checked);
      touched.value = true;
    }, [onChange, touched]);

    return (
      <label>
        {description && <NodeOptionDesc description={description}/>}
        <input class={'mr-1'} type={'checkbox'} checked={value} onChange={onInpChange}/>
        <span class={'ActionWorkflowsCore-form-control-text font-weight-normal'}>{label}</span>
      </label>
    );
  },
  renderView: ({value, option: {label}}) => (
    <Fragment>
      <i class={`fa mr-1 ${value ? 'fa-check text-success' : 'fa-times text-danger'}`}/>
      <span>{label}</span>
    </Fragment>
  ),
  token: Boolean,
});
