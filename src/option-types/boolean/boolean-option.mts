import {defineOption} from '../../lib/api.mjs';
import type {BooleanNodeOption} from '../../public_api';
import {makeComponent} from '../../ui/common.mjs';
import idView from './render-boolean-option-value.pug';
import idEdit from './render-boolean-option.pug';

defineOption<boolean, BooleanNodeOption>({
  hasLabel: false,
  is: (v): v is BooleanNodeOption => (
    v.type === Boolean
  ),
  renderEdit({option: {label}, initialValue, onChange}) {
    let val = Boolean(initialValue);

    return makeComponent(`#${idEdit}`, {
      label,
      get value(): boolean {
        return val;
      },
      set value(newVal: boolean) {
        onChange(val = newVal);
      },
    });
  },
  renderView({value, option: {label}}) {
    return makeComponent(`#${idView}`, {
      clazz: value ? ['fa-check', 'text-success'] : ['fa-times', 'text-danger'],
      label,
    });
  },
  token: Boolean,
});
