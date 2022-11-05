import {castArray, get, stubTrue} from 'lodash-es';
import type {NamespaceRegistry as TNamespaceRegistry} from 'melvor';
import {defineOption} from '../../lib/api.mjs';
import {isUndefinedOr} from '../../lib/util/is-undefined-or.mjs';
import type {
  MediaItemNodeOption,
  MediaItemNodeOptionMultiConfig,
  MediaSelectable as Item,
  MediaSelectable,
  Obj,
  OptionDefinition,
  OptionRenderEditCtx
} from '../../public_api';
import {makeComponent} from '../../ui/common.mjs';
import type {RenderNodeMediaProps} from '../../ui/pages/dashboard/render-node-media/render-node-media.mjs';
import RenderNodeMedia from '../../ui/pages/dashboard/render-node-media/render-node-media.mjs';
import tplIdMulti from './media-select-multi.pug';
import tplIdOne from './media-select-one.pug';
import multiMediaId from './render-multi-node-media.pug';

export const MediaItemOption: OptionDefinition<Item | Item[], MediaItemNodeOption> = {
  is(v): v is MediaItemNodeOption {
    const {type, mediaFilter, registry, multi} = v;


    return type === 'MediaItem'
      && isUndefinedOr(mediaFilter, 'function')
      && (
        typeof registry === 'function'
        || (
          (typeof registry === 'string' || Array.isArray(registry)) && get(game, registry) instanceof NamespaceRegistry
        )
      )
      && (!multi || multi === true || typeof multi === 'object');
  },
  renderEdit(ctx) {
    const multi = resolveMulti(ctx.option.multi);

    return multi
      ? RenderEditMulti({
        ...ctx,
        initialValue: ctx.initialValue == null ? [] : castArray(ctx.initialValue),
        option: {
          ...ctx.option,
          multi,
        },
      })
      : RenderEditOne(ctx as OptionRenderEditCtx<Item, MediaItemNodeOption>);
  },
  renderView({value}) {
    if (Array.isArray(value)) {
      const items: RenderNodeMediaProps[] = [];
      for (const v of value) {
        if (isPartialMediaSelectable(v)) {
          items.push({label: v.name, media: v.media});
        } else {
          return {};
        }
      }

      return RenderViewMulti(items);
    } else if (isPartialMediaSelectable(value)) {
      return RenderNodeMedia({label: value.name, media: value.media});
    }

    return {};
  },
  token: 'MediaItem',
};

defineOption(MediaItemOption);

const enum Numbers {
  MIN_SEARCH_LENGTH = 2,
  MAX_SEARCH_RESULTS = 10,
}

type OptMulti = Omit<MediaItemNodeOption, 'multi'> & {multi: MediaItemNodeOptionMultiConfig};

function RenderViewMulti(items: RenderNodeMediaProps[]) {
  return makeComponent(`#${multiMediaId}`, {
    items,
    RenderNodeMedia,
  });
}

type PartialMedia = Pick<MediaSelectable, 'name' | 'media'>;

function isPartialMediaSelectable(v: any): v is PartialMedia {
  return typeof v?.name === 'string' && typeof v.media === 'string';
}

type BasePartialCtx<T> = Pick<OptionRenderEditCtx<T, MediaItemNodeOption>, 'onChange'>;
export function RenderMediaItemOptionOneBase<T>( // eslint-disable-line @typescript-eslint/explicit-module-boundary-types
  init: BasePartialCtx<T> & Obj<any>,
  filterFn: (filterText: string) => T[]
) {
  let filterText = '';

  return makeComponent(`#${tplIdOne}`, {
    ...init,
    get filterText() {
      return filterText;
    },
    set filterText(newText: string) {
      filterText = newText;

      const trimmed = newText?.trim();
      this.results = ((trimmed?.length ?? 0) < Numbers.MIN_SEARCH_LENGTH)
        ? []
        : filterFn(trimmed.toLowerCase());
    },
    focusBtn: false,
    focusInput: false,
    onBtnInit,
    onInputInit,
    onItemInit,
    onKeyup,
    results: [] as T[],
    selectItem,
    unselect,
  });
}

function RenderEditOne<T extends Item>(init: OptionRenderEditCtx<T, MediaItemNodeOption>) {
  const reg = get(
    game,
    typeof init.option.registry === 'function'
      ? init.option.registry(init.otherValues)
      : init.option.registry
  ) as TNamespaceRegistry<T>;

  return RenderMediaItemOptionOneBase<T>(
    {...init, value: init.initialValue},
    filterText => ([...findItems({
      filter: init.option.mediaFilter,
      optionValues: init.otherValues,
      query: filterText,
      source: reg.registeredObjects.values(),
    })])
  );
}

function RenderEditMulti<T extends Item>(
  {option, onChange, initialValue, otherValues}: Required<OptionRenderEditCtx<T[], OptMulti>>
) {
  return makeComponent(`#${tplIdMulti}`, {
    add: addMulti,
    canAddAfter,
    onChange,
    option,
    otherValues,
    renderSingleInsideMulti,
    rm: multiRmAt,
    value: initialValue!,
  });
}

type ThisMulti<T extends Item> = ReturnType<typeof RenderEditMulti<T>>;
type This<T extends Item> = ReturnType<typeof RenderEditOne<T>> & {
  value?: T;
};

export interface FindItemsInit<T, V> {
  optionValues: V;
  query: string;
  source: Iterable<T>;

  filter?(item: T, optionValues: V): boolean;
}

export function *findItems<T extends Item, V extends object>(
  {optionValues, query, source, filter = stubTrue}: FindItemsInit<T, V>
): Iterable<T> {
  let emitCounter = 0;
  for (const item of source) {
    if (!filter(item, optionValues) || !item.name.toLowerCase().includes(query)) {
      continue;
    }

    yield item;
    if (++emitCounter === Numbers.MAX_SEARCH_RESULTS) {
      return;
    }
  }
}

function multiRmAt<T extends Item>(this: ThisMulti<T>, idx: number): void {
  this.value.splice(idx, 1);
  this.onChange(this.value);
}

function renderSingleInsideMulti<T extends Item>(this: ThisMulti<T>, idx: number, value: T) {
  return RenderEditOne({
    initialValue: value,
    onChange: v => {
      this.value[idx] = v!;
      this.onChange(this.value);
    },
    option: this.option,
    otherValues: this.otherValues,
  });
}

function addMulti<T extends Item>(this: ThisMulti<T>): void {
  this.value.push(undefined as any);
}

function canAddAfter<T extends Item>(this: ThisMulti<T>, idx: number): boolean {
  return idx === (this.value.length - 1) && idx < ((this.option.multi.maxLength ?? Number.MAX_VALUE) - 1);
}

function resolveMulti(option: MediaItemNodeOption['multi']): false | MediaItemNodeOptionMultiConfig {
  if (!option) {
    return false;
  }

  const defaults: MediaItemNodeOptionMultiConfig = {};

  return option === true ? defaults : Object.assign(defaults, option);
}

function unselect<T extends Item>(this: This<T>): void {
  this.value = undefined;
  this.focusInput = true;
  this.onChange(this.value);
}

function selectItem<T extends Item>(this: This<T>, item: T, event: Event): void {
  event.preventDefault();
  this.filterText = '';
  this.value = item;
  this.onChange(item);
}

function onItemInit<T extends Item>(el: HTMLElement, item: T): void {
  tippy(el, {content: item.name});
}

function onInputInit<T extends Item>(this: This<T>, el: HTMLElement): void {
  if (this.focusInput) {
    this.focusInput = false;
    el.focus();
  }
}

function onKeyup<T extends Item>(this: This<T>, e: KeyboardEvent): void {
  if (e.key !== 'Enter') {
    return;
  }

  if (this.results.length) {
    this.selectItem(this.results[0], e);
  } else {
    e.preventDefault();
  }
}

function onBtnInit<T extends Item>(this: This<T>, btn: HTMLElement): void {
  if (this.focusBtn) {
    this.focusBtn = false;
    btn.focus();
  }
}

