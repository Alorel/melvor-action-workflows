import type {NodeDefinition, NodeOption, Obj} from '../../../../public_api';
import {makeComponent} from '../../../common.mjs';
import RenderNodeMedia from '../render-node-media/render-node-media.mjs';
import {RenderNodeOptionValue} from '../render-node-option-value/render-node-option-value.mjs';
import tplId from './dashboard-node-def-section.pug';

interface Props {
  config: Obj<any>;

  node: NodeDefinition;
}

type This = ReturnType<typeof DashboardNodeDefSection>;

function optKey(this: This, opt: NodeOption): string {
  const show = this.shouldShow(opt);
  const key = show ? (opt.uiKey?.(this.config) ?? '') : '';

  return `${opt.localID}@${this.node.namespace}:${this.node.localID}#${String(show)}:${key}`;
}

function shouldShow(this: This, opt: NodeOption): boolean {
  return opt.showIf?.(this.config) ?? true;
}

function renderTr(this: This, option: NodeOption) {
  return RenderNodeOptionValue({
    option,
    otherValues: this.config,
    value: this.config[option.localID],
  });
}

export default function DashboardNodeDefSection({config, node}: Props) {
  return makeComponent(`#${tplId}`, {
    config,
    node,
    optKey,
    RenderNodeMedia,
    renderTr,
    shouldShow,
  });
}
