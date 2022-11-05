import {OPTION_REGISTRY} from '../../../../lib/registries/option-registry.mjs';
import {errorLog} from '../../../../lib/util/log.mjs';
import type {NodeOption, OptionRenderViewCtx} from '../../../../public_api';
import {makeComponent} from '../../../common.mjs';
import directTplId from './render-node-option-value-direct.html';
import mainId from './render-node-option-value.pug';

export function RenderNodeOptionValue<N extends NodeOption>(init: OptionRenderViewCtx<any, N>) {
  const spec = OPTION_REGISTRY.get(init.option.type);
  if (!spec) {
    errorLog(init.option.type);
    throw new Error('Unregistered option type - see preceding error');
  }

  const show = shouldShowNodeOptionValue(init.value);

  return makeComponent(
    `#${mainId}`,
    show
      ? {
        component: spec.renderView,
        init,
        show,
        showLabel: spec.hasLabel ?? true,
      }
      : {show}
  );
}

function shouldShowNodeOptionValue(value: any): boolean {
  return Array.isArray(value)
    ? value.length !== 0
    : value != null && value !== '';
}

export function RenderValueDirect(value: string | undefined) {
  return makeComponent(`#${directTplId}`, {
    value: value || '',
  });
}
