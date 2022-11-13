import type {Writable} from 'mod-util/writable';
import {OPTION_REGISTRY} from '../../../../lib/registries/option-registry.mjs';
import {errorLog} from '../../../../lib/util/log.mjs';
import {validateNodeOption} from '../../../../lib/util/validate-workflow.mjs';
import type {NodeOption, NodeOptionBase, NodeValidationStore, OptionRenderEditCtx} from '../../../../public_api';
import {makeComponent} from '../../../common.mjs';
import id from './render-node-option.pug';

type This = ReturnType<typeof RenderNodeOption<NodeOption>>;

function onDescMount(this: This, el: HTMLElement) {
  tippy(el, {content: this.init.option.description});
}

export default function RenderNodeOption<V extends NodeOption>(
  baseInit: Omit<OptionRenderEditCtx<any, V>, 'validation'>
) {
  const spec = OPTION_REGISTRY.get(baseInit.option.type);
  if (!spec) {
    errorLog(baseInit.option);
    throw new Error('Unregistered option type - see console.error prior');
  }

  const validation = ui.createStore<Writable<NodeValidationStore>>({
    errors: validateNodeOption(baseInit.initialValue, spec, baseInit.option, baseInit.otherValues),
    touched: false,
  });

  const origOnChange = baseInit.onChange;
  const init: OptionRenderEditCtx<any, V> = {
    ...baseInit,
    onChange(val) {
      validation.errors = validateNodeOption(val, spec, baseInit.option, baseInit.otherValues);

      return origOnChange.call(this, val);
    },
    validation,
  };

  return makeComponent(`#${id}`, {
    component: spec.renderEdit,
    hasLabel: spec.hasLabel ?? true,
    init,
    onDescMount,
    required: (init.option as Partial<NodeOptionBase>).required ?? false,
    validation,
  });
}
