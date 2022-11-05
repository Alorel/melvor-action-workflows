import {OPTION_REGISTRY} from '../../../../lib/registries/option-registry.mjs';
import {errorLog} from '../../../../lib/util/log.mjs';
import type {NodeOption, OptionRenderEditCtx} from '../../../../public_api';
import {makeComponent} from '../../../common.mjs';
import id from './render-node-option.pug';

type This = ReturnType<typeof RenderNodeOption<NodeOption>>;

function onDescMount(this: This, el: HTMLElement) {
  tippy(el, {content: this.init.option.description});
}

export default function RenderNodeOption<V extends NodeOption>(init: OptionRenderEditCtx<any, V>) {
  const spec = OPTION_REGISTRY.get(init.option.type);
  if (!spec) {
    errorLog(init.option);
    throw new Error('Unregistered option type - see console.error prior');
  }

  return makeComponent(`#${id}`, {
    component: spec.renderEdit,
    hasLabel: spec.hasLabel ?? true,
    init,
    onDescMount,
  });
}
