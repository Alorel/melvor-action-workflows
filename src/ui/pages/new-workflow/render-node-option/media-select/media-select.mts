import {castArray, get} from 'lodash-es';
import type {NamespaceRegistry} from 'melvor';
import type {
  MediaItemNodeOption,
  MediaItemNodeOptionMultiConfig,
  MediaSelectable as Item
} from '../../../../../public_api';
import {makeComponent} from '../../../../common.mjs';
import type {RenderNodeComponent} from '../render-node-option.mjs';
import tplIdMulti from './media-select-multi.pug';
import tplIdOne from './media-select-one.pug';

const enum Numbers {
  MIN_SEARCH_LENGTH = 2,
  MAX_SEARCH_RESULTS = 10,
}

type Params<T> = Parameters<RenderNodeComponent<MediaItemNodeOption, T | undefined>>;
type MultiParams<T> = Parameters<RenderNodeComponent<Omit<MediaItemNodeOption, 'multi'> & {multi: MediaItemNodeOptionMultiConfig}, T[]>>;

function RenderOne<T extends Item>([opt, value, onChange]: Params<T>) {
  return makeComponent(`#${tplIdOne}`, {
    filterText: '',
    focusBtn: false,
    focusInput: false,
    onBtnInit,
    onChange,
    onFilterChange,
    onInputInit,
    onItemInit,
    onKeyup,
    registry: opt.registry,
    results: [] as T[],
    selectItem,
    unselect,
    value,
  });
}

function RenderMulti<T extends Item>([opt, value, onChange]: MultiParams<T>) {
  return makeComponent(`#${tplIdMulti}`, {
    add: addMulti,
    canAddAfter,
    onChange,
    opt,
    renderSingleInsideMulti,
    rm: multiRmAt,
    value,
  });
}

export default function RenderMediaSelect<T extends Item>(...args: Params<T>) {
  const multi = resolveMulti(args[0].multi);

  if (!multi) {
    return RenderOne(args);
  }

  return RenderMulti([
    {...args[0], multi},
    args[1] == null ? [] : castArray(args[1]),
    args[2] as any,
  ]);
}

type ThisMulti<T extends Item> = ReturnType<typeof RenderMulti<T>>;
type This<T extends Item> = ReturnType<typeof RenderOne<T>>;

function *findItems<T extends Item>(
  registry: NamespaceRegistry<T>,
  query: string
): Iterable<T> {
  const q = query.trim().toLowerCase();
  if (q.length < Numbers.MIN_SEARCH_LENGTH) {
    return;
  }

  let emitCounter = 0;
  for (const item of registry.registeredObjects.values()) {
    if (!item.name.toLowerCase().includes(q)) {
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
  return RenderOne([
    this.opt,
    value,
    v => {
      this.value[idx] = v!;
      this.onChange(this.value);
    },
  ]);
}

function addMulti<T extends Item>(this: ThisMulti<T>): void {
  this.value.push(undefined as any);
}

function canAddAfter<T extends Item>(this: ThisMulti<T>, idx: number): boolean {
  return idx === (this.value.length - 1) && idx < (this.opt.multi.maxLength! - 1);
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

function onFilterChange<T extends Item>(this: This<T>, newText: string): void {
  this.filterText = newText;
  this.results = [...findItems<T>(get(game, this.registry), newText)];
}

function selectItem<T extends Item>(this: This<T>, item: T, event: Event): void {
  event.preventDefault();
  this.onFilterChange('');
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

