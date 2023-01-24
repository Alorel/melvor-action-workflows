import {isPlainObject} from 'lodash-es';
import type {VNode} from 'preact';
import {Fragment, h} from 'preact';
import {useCallback} from 'preact/hooks';
import type {OptionRenderEditCtx} from '../lib/define-option.mjs';
import {defineOption} from '../lib/define-option.mjs';
import {EMPTY_ARR, EMPTY_OBJ} from '../lib/util.mjs';
import {resolveDynamicOptionObject} from '../lib/util/dynamic-option.mjs';
import {isUndefinedOr} from '../lib/util/type-is.mjs';
import type {Obj, StringNodeOption} from '../public_api';
import Btn from '../ui/components/btn';
import {BinSvg} from '../ui/components/svg';
import {useRenderEditTouch} from './_common.mjs';

defineOption<string, StringNodeOption>({
  is(v): v is StringNodeOption {
    const {type, enum: vEnum, placeholder} = v as Partial<StringNodeOption>;

    return type === String
      && isUndefinedOr(placeholder, 'string')
      && (vEnum == null || isPlainObject(vEnum) || typeof vEnum === 'function');
  },
  renderEdit: ctx => h(ctx.option.enum ? RenderEnumOpts : RenderInput, ctx),
  renderView: ({value, option, otherValues}) => (
    <Fragment>{
      value && option.enum
        ? (resolveDynamicOptionObject(option.enum, otherValues)?.[value] ?? value)
        : value
    }</Fragment>
  ),
  token: String,
  validate(value: string | undefined, {enum: dEnum}: StringNodeOption, otherValues): string[] {
    if (value == null || !dEnum) {
      return EMPTY_ARR;
    }

    const obj: Obj<string> = resolveDynamicOptionObject(dEnum, otherValues) ?? EMPTY_OBJ;

    return value in obj
      ? EMPTY_ARR
      : [`Value should be one of the following: "${Object.values(dEnum).join('", "')}"`];
  },
});

function RenderInput({
  value = '',
  option: {placeholder},
  onChange,
}: OptionRenderEditCtx<string, StringNodeOption>): VNode {
  const [onBlur, onInp] = useInput(onChange);

  return (
    <input class={'form-control form-control-sm'}
      placeholder={placeholder ?? ''}
      onBlur={onBlur}
      onChange={onInp}
      value={value}/>
  );
}

function RenderEnumOpts({
  option: {enum: rawEnumOpts, required},
  otherValues,
  value = '',
  onChange,
}: OptionRenderEditCtx<string, StringNodeOption>): VNode {
  const [onBlur, onInp] = useInput(onChange);
  const clear = useCallback(() => {
    onChange(undefined);
  }, EMPTY_ARR);

  const enumOpts = resolveDynamicOptionObject(rawEnumOpts!, otherValues);

  return (
    <div class={'input-group'}>
      {!required && <Btn kind={'danger'} size={'sm'} onClick={clear}><BinSvg/></Btn>}
      <select class={'form-control form-control-sm'} onBlur={onBlur} onChange={onInp} value={value}>
        {enumOpts && Object.entries(enumOpts).map(renderEnumEntryMapper)}
      </select>
    </div>
  );
}

function useInput(onChange: (v?: string) => void) {
  const onBlur = useRenderEditTouch();
  const onInp = useCallback((e: Event) => {
    onChange((e.target as HTMLSelectElement).value || undefined);
  }, [onChange]);

  return [onBlur, onInp] as const;
}

function renderEnumEntryMapper([value, label]: [string, string]): VNode {
  return (<option key={value} value={value}>{label}</option>);
}
