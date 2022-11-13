import {Fragment} from 'preact';
import {useCallback} from 'preact/hooks';
import {defineOption} from '../lib/api.mjs';
import {EMPTY_ARR} from '../lib/util.mjs';
import {isUndefinedOr} from '../lib/util/is-undefined-or.mjs';
import type {NumberNodeOption} from '../public_api';
import useReRender from '../ui/hooks/re-render';
import {useRenderEditTouch} from './_common.mjs';

defineOption<number, NumberNodeOption>({
  is: (v): v is NumberNodeOption => (
    v.type === Number
    && isUndefinedOr(v.min, 'number')
    && isUndefinedOr(v.max, 'number')
    && isUndefinedOr(v.step, 'number')
  ),
  renderEdit({option: {max, min, step}, value, onChange}) {
    const reRender = useReRender();
    const onBlur = useRenderEditTouch();
    const onInp = useCallback((e: Event) => {
      const newVal = (e.target as HTMLInputElement).value;
      const asNum = parseFloat(newVal);

      if (isNaN(asNum)) {
        onChange(undefined);
      } else if (newVal.endsWith('.')) {
        value = newVal as any; // eslint-disable-line no-param-reassign
        reRender();
      } else {
        onChange(asNum);
      }
    }, [onChange]);

    return (
      <input class={'form-control form-control-sm'}
        type={'number'}
        onBlur={onBlur}
        value={value ?? ''}
        onInput={onInp}
        max={max ?? ''}
        min={min ?? ''}
        step={step ?? ''}/>
    );
  },
  renderView: ({value}) => (<Fragment>{value?.toLocaleString()}</Fragment>),
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
