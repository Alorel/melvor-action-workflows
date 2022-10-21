import type {StringNodeOption} from '../../../../../public_api';
import {makeComponent} from '../../../../common.mjs';
import ClearBtn from '../../../../components/clear-btn/clear-btn.mjs';
import type {RenderNodeComponent} from '../render-node-option.mjs';
import id from './render-string-node-option.pug';

function onInput(this: ReturnType<typeof makeDef>, newVal: string): void {
  this.value = newVal?.trim() || undefined;
  this.onChange(this.value);
}

function makeDef([{enum: enumOpts, required}, value, onChange]: Parameters<typeof RenderStringNodeOption>) {
  return {
    ClearBtn,
    enumOpts,
    onChange,
    onInput,
    required: Boolean(required),
    value,
  };
}

const RenderStringNodeOption: RenderNodeComponent<StringNodeOption, string | undefined> =
  (...args) => makeComponent(`#${id}`, makeDef(args));

export default RenderStringNodeOption;
