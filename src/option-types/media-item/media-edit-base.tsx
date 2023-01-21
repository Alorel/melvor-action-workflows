import type {ReadonlySignal} from '@preact/signals';
import {useComputed, useSignal} from '@preact/signals';
import type {ComponentType, VNode} from 'preact';
import {Fragment} from 'preact';
import {memo} from 'preact/compat';
import type {Ref} from 'preact/hooks';
import {useCallback, useEffect, useRef, useState} from 'preact/hooks';
import type {OptionRenderEditCtx} from '../../lib/define-option.mjs';
import {EMPTY_ARR} from '../../lib/util.mjs';
import type {MediaItemNodeOption, MediaSelectable} from '../../public_api';
import Btn from '../../ui/components/btn';
import useTippy from '../../ui/hooks/tippy.mjs';
import {useRenderEditTouch} from '../_common.mjs';

interface Props<T> extends Pick<OptionRenderEditCtx<T, MediaItemNodeOption>, 'onChange' | 'value'>,
  Pick<MediaItemNodeOption, 'itemRender' | 'icon'> {

  filterFn(filterText: string): T[];
}

const RenderMediaItemOptionOneBase = memo(
  function <T extends MediaSelectable> ({filterFn, icon, value, onChange, itemRender}: Props<T>): VNode {
    const [focus, setFocus] = useState(false);
    const changeAndFocus = useCallback((val?: T): void => {
      setFocus(true);
      onChange(val);
    }, [onChange]);

    return value
      ? (<RenderBtn icon={icon} onChange={changeAndFocus} value={value}/>)
      : (
        <RenderFilter
          itemRender={itemRender}
          icon={icon}
          focus={focus}
          onChange={changeAndFocus}
          filterFn={filterFn}/>
      );
  }
);

export default RenderMediaItemOptionOneBase;

type BtnProps<T> = Required<Pick<Props<T>, 'value' | 'onChange'>> & Pick<Props<T>, 'icon'>;

function RenderBtn<T extends MediaSelectable>({icon = true, value, onChange}: BtnProps<T>): VNode {
  const unselect = useCallback(() => {
    onChange(undefined);
  }, [onChange]);

  return (
    <Btn kind={'primary'} size={'sm'} onClick={unselect}>
      {icon && <img class={'ActionWorkflowsCore-font-sized mr-1'} src={value.media} alt={'Icon'}/>}
      <span>{value.name}</span>
    </Btn>
  );
}

interface InnerProps<T> extends Pick<Props<T>, 'filterFn' | 'onChange' | 'itemRender' | 'icon'> {
  focus: boolean;
}

function RenderFilter<T extends MediaSelectable>({focus, filterFn, icon, itemRender, onChange}: InnerProps<T>) {
  const filterText = useSignal('');
  const results = useComputed((): T[] => {
    const txt = filterText.value;

    return txt.length ? filterFn(txt.toLowerCase()) : EMPTY_ARR;
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
      <input
        class={'form-control form-control-sm'}
        ref={inputRef}
        onKeyUp={onKeyup}
        onInput={onInp}
        onBlur={onBlur}
        placeholder={'Search by name…'}/>
      <ItemsRender icon={icon} itemRender={itemRender} results={results} onItemClick={onItemClick}/>
    </div>
  );
}

interface ItemsRenderProps<T> {

  /** @default true */
  icon?: boolean;

  itemRender?: ComponentType<{item: T;}>;

  results: ReadonlySignal<T[]>;

  onItemClick(e: Event): void;
}

function DefaultItemRender<T extends MediaSelectable>({item}: {item: T}): VNode {
  return <Fragment>{item.name}</Fragment>;
}

const ItemsRender = memo(
  function <T extends MediaSelectable> ({
    icon = true,
    itemRender: ItemRender = DefaultItemRender,
    onItemClick,
    results,
  }: ItemsRenderProps<T>): VNode {
    const classKey = icon ? '' : 'p-1 pl-2 pr-2 list-group-item list-group-item-dark list-group-item-action';

    return (
      <div onClick={onItemClick} class={icon ? '' : 'list-group ActionWorkflowsCore-list-mh'}>
        {results.value.map((item, idx) => (
          <a key={item.id} role={'button'} data-idx={idx} class={classKey}>
            {
              icon
                ? <ItemImg item={item}/>
                : <ItemRender item={item}/>
            }
          </a>
        ))}
      </div>
    );
  }
);

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

function ItemImg<T extends MediaSelectable>({item: {media, name}}: {item: T}): VNode {
  const ref = useTippy<HTMLImageElement>(name);

  return (
    <img className={'skill-icon-xs'} ref={ref} src={media} alt={name}/>
  );
}
