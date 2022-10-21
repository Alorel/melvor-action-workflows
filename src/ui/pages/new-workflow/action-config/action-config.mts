import type ActionConfigItem from '../../../../lib/data/action-config-item.mjs';
import type {ActionNodeDefinitionImpl} from '../../../../lib/registries/action-registry.mjs';
import type {NodeOption} from '../../../../public_api';
import {makeComponent} from '../../../common.mjs';
import ActionSelect from '../categorised-node-select/action-select.mjs';
import RenderNodeOption from '../render-node-option/render-node-option.mjs';
import tplId from './action-config.pug';

interface Props {
  action: ActionConfigItem;

  removable?: boolean;

  onChange?(action: ActionConfigItem): void;

  remove(action: ActionConfigItem): void;
}

type This = ReturnType<typeof ActionConfig>;

function doRemove(this: This): void {
  this.remove(this.action);
}

function optKey(this: This, opt: NodeOption): string {
  return `${opt.localID}@${this.action.action.id}`;
}

function onActionChange(this: This, newAction: ActionNodeDefinitionImpl<any>): void {
  this.action.action = newAction;
  this.action.resetOpts();
  this.opts = newAction.def.options ?? [];
  this.onChange?.(this.action);
}

function renderActionSelect(this: This) {
  return ActionSelect({
    deletable: this.removable,
    onChange: this.onActionChange,
    onDelete: this.doRemove,
    value: this.action.action,
  });
}

function renderNodeOption(this: This, opt: NodeOption) {
  const id = opt.localID;

  return RenderNodeOption(opt, this.action.opts[id], (val: any) => {
    this.action.opts[id] = val;
    this.onChange?.(this.action);
  });
}

export default function ActionConfig(props: Props) {
  const removable = props.removable ?? true;

  return makeComponent(`#${tplId}`, {
    action: props.action,
    actionCol: [removable ? 'col-11' : 'col-12'],
    doRemove,
    onActionChange,
    onChange: props.onChange,
    optKey,
    opts: props.action.action.def.options ?? [],
    removable,
    remove: props.remove,
    renderActionSelect,
    renderNodeOption,
  });
}
