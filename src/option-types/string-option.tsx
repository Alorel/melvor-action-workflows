import {isPlainObject} from 'lodash-es';
import type {VNode} from 'preact';
import {Fragment, h} from 'preact';
import {useMemo} from 'preact/compat';
import {useCallback} from 'preact/hooks';
import {defineOption} from '../lib/api.mjs';
import {EMPTY_ARR} from '../lib/util.mjs';
import type {OptionRenderEditCtx, StringNodeOption} from '../public_api';
import Btn from '../ui/components/btn';
import {BinSvg} from '../ui/components/svg';
import {useRenderEditTouch} from './_common.mjs';

defineOption<string, StringNodeOption>({
  is: (v): v is StringNodeOption => (
    v.type === String
    && (v.enum == null || isPlainObject(v.enum))
  ),
  renderEdit: ctx => h(ctx.option.enum ? RenderEnumOpts : RenderInput, ctx),
  renderView: ({value, option}) => (
    <Fragment>{
      value && option.enum
        ? option.enum[value] ?? value
        : value
    }</Fragment>
  ),
  token: String,
  validate: (value: string | undefined, {enum: dEnum}: StringNodeOption): string[] => (
    value != null && dEnum && !(value in dEnum)
      ? [`Value should be one of the following: "${Object.values(dEnum).join('", "')}"`]
      : EMPTY_ARR
  ),
});

function RenderInput({
  value = '',
  onChange,
}: OptionRenderEditCtx<string, StringNodeOption>): VNode {
  const [onBlur, onInp] = useInput(onChange);

  return (
    <input class={'form-control form-control-sm'} onBlur={onBlur} onChange={onInp} value={value}/>
  );
}

function RenderEnumOpts({
  option: {enum: enumOpts, required},
  value = '',
  onChange,
}: OptionRenderEditCtx<string, StringNodeOption>): VNode {
  const [onBlur, onInp] = useInput(onChange);
  const clear = useCallback(() => {
    onChange(undefined);
  }, []);
  const entries = useMemo(() => Object.entries(enumOpts!), [enumOpts]);

  return (
    <div class={'input-group'}>
      {!required && <Btn kind={'danger'} size={'sm'} onClick={clear}><BinSvg/></Btn>}
      <select class={'form-control form-control-sm'} onBlur={onBlur} onChange={onInp} value={value}>
        {entries.map(renderEnumEntryMapper)}
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
