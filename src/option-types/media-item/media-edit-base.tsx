import {useComputed, useSignal} from '@preact/signals';
import type {VNode} from 'preact';
import {memo} from 'preact/compat';
import type {Ref} from 'preact/hooks';
import {useCallback, useEffect, useRef, useState} from 'preact/hooks';
import type {OptionRenderEditCtx} from '../../lib/define-option.mjs';
import {EMPTY_ARR} from '../../lib/util.mjs';
import type {MediaItemNodeOption, MediaSelectable} from '../../public_api';
import Btn from '../../ui/components/btn';
import useTippy from '../../ui/hooks/tippy.mjs';
import {useRenderEditTouch} from '../_common.mjs';
import {MediaItemNumbers} from './render-media-commons.mjs';

interface Props<T> extends Pick<OptionRenderEditCtx<T, MediaItemNodeOption>, 'onChange' | 'value'> {
  filterFn(filterText: string): T[];
}

const RenderMediaItemOptionOneBase = memo(
  function <T extends MediaSelectable> ({filterFn, value, onChange}: Props<T>): VNode {
    const [focus, setFocus] = useState(false);
    const changeAndFocus = useCallback((val?: T): void => {
      setFocus(true);
      onChange(val);
    }, [onChange]);

    return value
      ? (<RenderBtn onChange={changeAndFocus} value={value}/>)
      : (<RenderFilter focus={focus} onChange={changeAndFocus} filterFn={filterFn}/>);
  }
);

export default RenderMediaItemOptionOneBase;

type BtnProps<T> = Required<Pick<Props<T>, 'value' | 'onChange'>>;

function RenderBtn<T extends MediaSelectable>({value, onChange}: BtnProps<T>): VNode {
  const unselect = useCallback(() => {
    onChange(undefined);
  }, [onChange]);

  return (
    <Btn kind={'primary'} size={'sm'} onClick={unselect}>
      <img class={'ActionWorkflowsCore-font-sized mr-1'} src={value.media}/>
      <span>{value.name}</span>
    </Btn>
  );
}

interface InnerProps<T> extends Pick<Props<T>, 'filterFn' | 'onChange'> {
  focus: boolean;
}

function RenderFilter<T extends MediaSelectable>({focus, filterFn, onChange}: InnerProps<T>) {
  const filterText = useSignal('');
  const results = useComputed((): T[] => {
    const txt = filterText.value;

    return txt.length < MediaItemNumbers.MIN_SEARCH_LENGTH ? EMPTY_ARR : filterFn(txt.toLowerCase());
  });

  const onBlur = useRenderEditTouch();
  const onInp = useCallback((e: Event) => {
    filterText.value = (e.target as HTMLInputElement).value.trim();
  }, [filterText]);
  const onKeyup = useCallback((e: KeyboardEvent) => {
    if (e.key !== 'Enter') {
      return;
    }

    const first = results.value[0];
    if (first) {
      onChange(first);
    } else {
      e.preventDefault();
    }
  }, [onChange, results]);

  const inputRef = useFocus<HTMLInputElement>(focus);

  const onItemClick = useCallback((e: Event) => {
    const tgt = e.target as HTMLElement;
    const idx = parseInt(((tgt.tagName === 'A' ? tgt : tgt.parentElement)?.dataset.idx) as unknown as string);
    if (!isNaN(idx)) {
      onChange(results.value[idx]);
    }
  }, [results]);

  return (
    <div>
      <input class={'form-control form-control-sm'}
        ref={inputRef}
        onKeyUp={onKeyup}
        onInput={onInp}
        onBlur={onBlur}
        placeholder={'Search by name…'}/>
      <div onClick={onItemClick}>
        {results.value.map(itemMapper)}
      </div>
    </div>
  );
}

/** Focus an element this ref gets attached to on init if `focus` is true */
function useFocus<T extends HTMLElement>(focus: boolean): Ref<T> {
  const ref = useRef<T>(null);
  useEffect(() => {
    if (focus) {
      ref.current?.focus();
    }
  }, []);

  return ref;
}

function itemMapper<T extends MediaSelectable>(item: T, idx: number): VNode {
  return (
    <a key={item.id} role={'button'} data-idx={idx}>
      <ItemImg item={item}/>
    </a>
  );
}

function ItemImg<T extends MediaSelectable>({item: {media, name}}: {item: T}): VNode {
  const ref = useRef<HTMLImageElement>(null);
  useTippy(name, ref);

  return (
    <img className={'skill-icon-xs'} ref={ref} src={media} alt={name}/>
  );
}
