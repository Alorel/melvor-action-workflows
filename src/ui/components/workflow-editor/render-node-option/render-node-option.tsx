import {signal, useComputed, useSignal} from '@preact/signals';
import {isEqual} from 'lodash-es';
import type {VNode} from 'preact';
import {h} from 'preact';
import {memo} from 'preact/compat';
import {useCallback, useMemo} from 'preact/hooks';
import type {OptionDefinition, OptionRenderEditCtx} from '../../../../lib/define-option.mjs';
import {OPTION_REGISTRY} from '../../../../lib/registries/option-registry.mjs';
import {validateNodeOption} from '../../../../lib/util/validate-workflow.mjs';
import type {NodeOption, NodeOptionBase} from '../../../../public_api';
import useTippy from '../../../hooks/tippy.mjs';
import Td from '../../td';
import {ProvideNodeValidationCtx} from './node-option-validation-ctx';

const RenderNodeOption = memo<OptionRenderEditCtx<any, any>>(({option: opt, ...rest}): VNode => {
  const spec = OPTION_REGISTRY.get(opt.type);

  return (
    <tr>
      {spec
        ? <Inner spec={spec} option={opt} {...rest}/>
        : <Err type={opt.type}/>
      }
    </tr>
  );
});

export default RenderNodeOption;

interface InnerProps extends OptionRenderEditCtx<any, any> {
  spec: OptionDefinition<any, any>;
}

function Inner({option: opt, otherValues, spec, value, onChange: onChangeOut}: InnerProps): VNode {
  const errors = useMemo(() => signal(validateNodeOption(value, spec, opt, otherValues)), []);
  const touched = useSignal(false);
  const invalid = useComputed(() => errors.value.length !== 0);

  const onChange = useCallback((v?: any): void => {
    onChangeOut(v);
    const newErrors = validateNodeOption(v, spec, opt, otherValues);
    if (!isEqual(newErrors, errors.peek())) {
      errors.value = newErrors;
    }
  }, [otherValues, spec, opt, onChangeOut]);

  const hasLabel = spec.hasLabel ?? true;

  return (
    <ProvideNodeValidationCtx errors={errors} touched={touched} invalid={invalid}>
      {hasLabel && h(Label, opt)}
      {/* eslint-disable-next-line @typescript-eslint/no-magic-numbers */}
      <Td colSpan={hasLabel ? 1 : 2} class={touched.value ? 'ActionWorkflowsCore-touched' : ''}>
        <div class={invalid.value ? 'ActionWorkflowsCore-f-invalid' : ''}>
          {h(spec.renderEdit, {onChange, option: opt, otherValues, value})}
        </div>
        {invalid.value && <Errors errors={errors.value}/>}
      </Td>
    </ProvideNodeValidationCtx>
  );
}

function Label(opt: NodeOption): VNode {
  return (
    <Td>
      {opt.description && <Desc description={opt.description}/>}
      {(opt as Partial<NodeOptionBase>).required && <span class={'mr-1'}>{'*'}</span>}
      <span>{opt.label}</span>
    </Td>
  );
}

function Errors({errors}: {errors: string[]}): VNode {
  return (
    <div class={'text-danger ActionWorkflowsCore-err-render'}>
      {errors.map((e, idx) => <div key={idx}>{e}</div>)}
    </div>
  );
}

function Desc({description}: Pick<NodeOption, 'description'>): VNode {
  const el = useTippy(description);

  return (<i ref={el} class={'fa fa-question-circle mr-1'}/>);
}

function Err({type}: Pick<NodeOption, 'type'>): VNode {
  return (<td colSpan={2} class={'text-danger'}>{`Unregistered option type: ${String(type)}`}</td>);
}
