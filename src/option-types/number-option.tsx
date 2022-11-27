import {Fragment} from 'preact';
import {useCallback} from 'preact/hooks';
import {defineOption} from '../lib/define-option.mjs';
import {EMPTY_ARR} from '../lib/util.mjs';
import {resolveDynamicOptionObject} from '../lib/util/dynamic-option.mjs';
import {isUndefinedOr, typeIs} from '../lib/util/type-is.mjs';
import type {NumberNodeOption} from '../public_api';
import useReRender from '../ui/hooks/re-render';
import {useRenderEditTouch} from './_common.mjs';

defineOption<number, NumberNodeOption>({
  is(v): v is NumberNodeOption {
    const {type, max, min, step} = v as Partial<NumberNodeOption>;

    return type === Number
      && (min == null || typeIs(min, 'number', 'function'))
      && (max == null || typeIs(max, 'number', 'function'))
      && isUndefinedOr(step, 'number');
  },
  renderEdit({
    option: {max, min, step},
    value,
    onChange,
    otherValues,
  }) {
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
        max={resolveDynamicOptionObject(max, otherValues) ?? ''}
        min={resolveDynamicOptionObject(min, otherValues) ?? ''}
        step={step ?? ''}/>
    );
  },
  renderView: ({value}) => (<Fragment>{value?.toLocaleString()}</Fragment>),
  token: Number,
  validate(value: number | undefined, {max: rMax, min: rMin}: NumberNodeOption, otherValues): string[] {
    if (value == null) {
      return EMPTY_ARR;
    }

    const out: string[] = [];

    let check = resolveDynamicOptionObject(rMin, otherValues);
    if (check != null && value < check) {
      out.push(`Min value: ${check.toLocaleString()}`);
    }

    check = resolveDynamicOptionObject(rMax, otherValues);
    if (check != null && value > check) {
      out.push(`Max value: ${check.toLocaleString()}`);
    }

    return out.length ? out : EMPTY_ARR;
  },
});
