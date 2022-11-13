import {isPlainObject} from 'lodash-es';
import {defineOption} from '../../lib/api.mjs';
import {EMPTY_ARR} from '../../lib/util.mjs';
import type {NodeValidationStore, StringNodeOption} from '../../public_api';
import {makeComponent} from '../../ui/common.mjs';
import ClearBtn from '../../ui/components/clear-btn/clear-btn.mjs';
import {RenderValueDirect} from '../../ui/pages/dashboard/render-node-option-value/render-node-option-value.mjs';
import id from './render-string-node-option.pug';

defineOption<string, StringNodeOption>({
  is: (v): v is StringNodeOption => (
    v.type === String
    && (v.enum == null || isPlainObject(v.enum))
  ),
  renderEdit({
    option: {enum: enumOpts, required},
    initialValue,
    onChange,
    validation,
  }) {
    let val = initialValue;

    return makeComponent(`#${id}`, {
      ClearBtn,
      enumOpts,
      required: Boolean(required),
      touch,
      validation,
      get value(): string {
        return val ?? '';
      },
      set value(newVal: string | undefined) {
        val = newVal?.trim() || undefined;
        onChange(val);
      },
    });
  },
  renderView: ({value, option}) => (
    RenderValueDirect(
      value && option.enum
        ? option.enum[value] ?? value
        : value
    )
  ),
  token: String,
  validate: (value: string | undefined, {enum: dEnum}: StringNodeOption): string[] => (
    value != null && dEnum && !(value in dEnum)
      ? [`Value should be one of the following: "${Object.values(dEnum).join('", "')}"`]
      : EMPTY_ARR
  ),
});

function touch(this: {validation: NodeValidationStore}): void {
  this.validation.touched = true;
}
