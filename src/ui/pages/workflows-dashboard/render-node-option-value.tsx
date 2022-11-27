import type {VNode} from 'preact';
import {h} from 'preact';
import type {OptionRenderViewCtx} from '../../../lib/define-option.mjs';
import {OPTION_REGISTRY} from '../../../lib/registries/option-registry.mjs';
import {errorLog} from '../../../lib/util/log.mjs';
import type {NodeOption} from '../../../public_api';
import Td from '../../components/td';

export default function RenderNodeOptionValue<N extends NodeOption>(init: OptionRenderViewCtx<any, N>): VNode | null {
  const spec = OPTION_REGISTRY.get(init.option.type);
  if (!spec) {
    errorLog(init.option.type);
    throw new Error('Unregistered option type - see preceding error');
  }

  if (!shouldShowNodeOptionValue(init.value)) {
    return null;
  }

  const showLabel = spec.hasLabel ?? true;

  return (
    <tr>
      {showLabel && (<Td>{init.option.label}</Td>)}
      {/* eslint-disable-next-line @typescript-eslint/no-magic-numbers */}
      <Td class={'text-right'} colSpan={showLabel ? 1 : 2}>
        {h(spec.renderView, init)}
      </Td>
    </tr>
  );
}

function shouldShowNodeOptionValue(value: any): boolean {
  return Array.isArray(value)
    ? value.length !== 0
    : value != null && value !== '';
}
