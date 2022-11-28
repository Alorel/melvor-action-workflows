import {castArray} from 'lodash-es';
import type {VNode} from 'preact';
import {h} from 'preact';
import {memo, useMemo} from 'preact/compat';
import {useCallback} from 'preact/hooks';
import type {OptionRenderEditCtx} from '../../lib/define-option.mjs';
import type {MediaItemNodeOption, MediaItemNodeOptionMultiConfig, MediaSelectable} from '../../public_api';
import Btn from '../../ui/components/btn';
import {BinSvg} from '../../ui/components/svg';
import type {MediaOptionValue} from '../media-item-option.mjs';
import RenderMediaItemOptionOneBase from './media-edit-base';
import {findItems, resolveMediaItemRegistry, resolveMediaMulti} from './render-media-commons.mjs';

export default function RenderMediaEdit(ctx: OptionRenderEditCtx<MediaOptionValue, MediaItemNodeOption>): VNode {
  const option = usePatchedOption(ctx.option);

  const patchedCtx: typeof ctx = {
    ...ctx,
    option,
  };

  return h<any>(option.multi ? RenderEditMulti : RenderEditOne, patchedCtx);
}

type PatchedOption = Omit<MediaItemNodeOption, 'multi'> & {multi: ReturnType<typeof resolveMediaMulti>};

function usePatchedOption(opt: MediaItemNodeOption): PatchedOption {
  const multi = useMemo(() => resolveMediaMulti(opt.multi), [JSON.stringify(opt.multi)]);

  return useMemo((): PatchedOption => ({...opt, multi}), [multi, opt]);
}

interface OptMulti extends Omit<MediaItemNodeOption, 'multi'> {
  multi: MediaItemNodeOptionMultiConfig;
}

type EditMultiProps<T> = OptionRenderEditCtx<T[], OptMulti>;

const RenderEditMulti = memo(function <T extends MediaSelectable> ({ // eslint-disable-line max-lines-per-function
  option,
  onChange,
  value,
  otherValues,
}: EditMultiProps<T>) {
  const valNormalised = useMemo(() => value == null ? [] : castArray(value), [value]);

  const add = useCallback(() => {
    onChange([...valNormalised, undefined as any]);
  }, [valNormalised, onChange]);

  const rmAt = useCallback((e: Event): void => {
    let btn: HTMLElement | null = (e.target as HTMLElement);
    while (btn && btn.tagName !== 'BUTTON') {
      btn = btn.parentElement;
    }

    const idx = parseInt(btn?.dataset.idx as string);
    if (!isNaN(idx)) {
      const out = [...valNormalised];
      out.splice(idx, 1);
      onChange(out);
    }
  }, [valNormalised, onChange]);

  if (!valNormalised.length) {
    return (<Btn kind={'success'} size={'sm'} onClick={add}>{'+'}</Btn>);
  }

  const lastIdx = valNormalised.length - 1;
  const maxLength = (option.multi.maxLength ?? Number.MAX_VALUE) - 1;

  return (
    <div class={'ActionWorkflowsCore-d-inline-tbl'}>
      {valNormalised.map((item, idx) => (
        <div key={idx}>
          <div>
            <div class={'btn-group btn-group-sm'} role={'group'}>
              {valNormalised.length > 1 && <Btn kind={'danger'} data-idx={idx} onClick={rmAt}><BinSvg/></Btn>}
              {idx === lastIdx && idx < maxLength && <Btn kind={'success'} onClick={add}>{'+'}</Btn>}
            </div>
          </div>

          <div>
            <RenderEditOne focusInput={idx !== 0}
              value={item}
              option={option}
              otherValues={otherValues}
              onChange={newVal => {
                const out = [...valNormalised];
                out[idx] = newVal!;
                onChange(out);
              }}/>
          </div>
        </div>
      ))}
    </div>
  );
});

interface EditOneProps<T> extends OptionRenderEditCtx<T, MediaItemNodeOption> {
  focusInput?: boolean;
}

const RenderEditOne = memo(function <T extends MediaSelectable> ({
  onChange,
  option: {mediaFilter, registry},
  otherValues,
  value,
}: EditOneProps<T>) {
  const reg = resolveMediaItemRegistry<T>(registry, otherValues)!;

  const filterFn = useCallback((filterText: string) => ([...findItems({
    filter: mediaFilter,
    optionValues: otherValues,
    query: filterText,
    source: reg.registeredObjects.values(),
  })]), [otherValues, reg, mediaFilter]);

  return (
    <RenderMediaItemOptionOneBase value={value}
      filterFn={filterFn}
      onChange={onChange}/>
  );
});
