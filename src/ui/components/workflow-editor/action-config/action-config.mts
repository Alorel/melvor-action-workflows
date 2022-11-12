import type ActionConfigItem from '../../../../lib/data/action-config-item.mjs';
import type {ActionNodeDefinitionImpl} from '../../../../lib/registries/action-registry.mjs';
import type {NodeOption} from '../../../../public_api';
import {makeComponent} from '../../../common.mjs';
import ActionSelect from '../categorised-node-select/action-select.mjs';
import type {CategorisedNodeSelectBtn} from '../categorised-node-select/categorised-node-select.mjs';
import RenderNodeOption from '../render-node-option/render-node-option.mjs';
import tplId from './action-config.pug';

interface Props {
  action: ActionConfigItem;

  idxMoves: Array<1 | -1>;

  removable?: boolean;

  onChange?(action: ActionConfigItem): void;

  remove(action: ActionConfigItem): void;

  shiftIdx?(action: ActionConfigItem, direction: 1 | -1): void;
}

type This = ReturnType<typeof ActionConfig>;

function doRemove(this: This): void {
  this.remove(this.action);
}

function optKey(this: This, opt: NodeOption): string {
  const show = this.shouldShow(opt);
  const key = show ? (opt.uiKey?.(this.action.opts) ?? '') : '';

  return `${opt.localID}@${this.action.action.id}:${String(show)}:${key}`;
}

function onActionMount(this: This, opt: NodeOption, el: HTMLElement): void {
  if (!this.shouldShow(opt)) {
    el.hidden = true;
    this.action.opts[opt.localID] = undefined;
  }
}

function onActionChange(this: This, newAction: ActionNodeDefinitionImpl<any>): void {
  this.action.action = newAction;
  this.action.resetOpts();
  this.opts = newAction.def.options ?? [];
  this.onChange?.(this.action);
}

function shouldShow(this: This, opt: NodeOption): boolean {
  return opt.showIf?.(this.action.opts) ?? true;
}

function renderActionSelect(this: This) {
  const buttons = this.idxMoves
    .map((idxShift): CategorisedNodeSelectBtn => ({
      css: 'btn-outline-light',
      key: `idxShift${idxShift}`,
      onClick: () => {
        this.shiftIdx?.(this.action, idxShift);
      },
      text: idxShift === 1 ? '→' : '←',
    }));
  if (this.removable) {
    buttons.push({
      css: 'btn-outline-danger',
      key: 'rm',
      onClick: this.doRemove,
      text: '×',
    });
  }

  return ActionSelect({
    buttons,
    onChange: this.onActionChange,
    value: this.action.action,
  });
}

function renderNodeOption(this: This, option: NodeOption) {
  const id = option.localID;

  return RenderNodeOption({
    initialValue: this.action.opts[id],
    onChange: val => {
      this.action.opts[id] = val;
      this.onChange?.(this.action);
    },
    option,
    otherValues: this.action.opts,
  });
}

export default function ActionConfig(props: Props) {
  const removable = props.removable ?? true;

  return makeComponent(`#${tplId}`, {
    action: props.action,
    actionCol: [removable ? 'col-11' : 'col-12'],
    doRemove,
    idxMoves: props.idxMoves,
    onActionChange,
    onActionMount,
    onChange: props.onChange,
    optKey,
    opts: props.action.action.def.options ?? [],
    removable,
    remove: props.remove,
    renderActionSelect,
    renderNodeOption,
    shiftIdx: props.shiftIdx,
    shouldShow,
  });
}
