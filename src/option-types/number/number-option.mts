import {defineOption} from '../../lib/api.mjs';
import {EMPTY_ARR} from '../../lib/util.mjs';
import {isUndefinedOr} from '../../lib/util/is-undefined-or.mjs';
import type {NumberNodeOption} from '../../public_api';
import {makeComponent} from '../../ui/common.mjs';
import {RenderValueDirect} from '../../ui/pages/dashboard/render-node-option-value/render-node-option-value.mjs';
import id from './render-number-node-option.pug';

defineOption<number, NumberNodeOption>({
  is: (v): v is NumberNodeOption => (
    v.type === Number
    && isUndefinedOr(v.min, 'number')
    && isUndefinedOr(v.max, 'number')
    && isUndefinedOr(v.step, 'number')
  ),
  renderEdit({option, initialValue, onChange, validation}) {
    let val = initialValue;

    return makeComponent(`#${id}`, {
      onChange,
      option,
      validation,
      get value(): number | '' {
        return val ?? '';
      },
      set value(newVal: string | number | undefined) {
        switch (typeof newVal) {
          case 'number':
            val = newVal;
            break;
          case 'string': {
            const asNum = parseFloat(newVal);
            if (isNaN(asNum)) {
              val = undefined;
            } else if (newVal.endsWith('.')) {
              val = newVal as any;
              return; // don't emit change
            } else {
              val = asNum;
            }
            break;
          }
          default:
            val = undefined;
        }

        this.onChange(val);
      },
    });
  },
  renderView: ({value}) => RenderValueDirect(value?.toLocaleString()),
  token: Number,
  validate(value: number | undefined, {max, min}: NumberNodeOption): string[] {
    if (value == null) {
      return EMPTY_ARR;
    }

    const out: string[] = [];

    if (min != null && value < min) {
      out.push(`Min value: ${min.toLocaleString()}`);
    }
    if (max != null && value > max) {
      out.push(`Max value: ${max.toLocaleString()}`);
    }

    return out.length ? out : EMPTY_ARR;
  },
});
