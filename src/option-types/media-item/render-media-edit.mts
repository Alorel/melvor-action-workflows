import {castArray} from 'lodash-es';
import type {
  MediaItemNodeOption,
  MediaItemNodeOptionMultiConfig,
  MediaSelectable,
  NodeValidationStore,
  Obj,
  OptionDefinition,
  OptionRenderEditCtx
} from '../../public_api';
import {makeComponent} from '../../ui/common.mjs';
import type {MediaOptionValue} from './media-item-option.mjs';
import tplIdMulti from './media-select-multi.pug';
import tplIdOne from './media-select-one.pug';
import {findItems, MediaItemNumbers, resolveMediaItemRegistry, resolveMediaMulti} from './render-media-commons.mjs';

const RenderMediaEdit: OptionDefinition<MediaOptionValue, MediaItemNodeOption>['renderEdit']
  = ctx => {
    const multi = resolveMediaMulti(ctx.option.multi);

    return multi
      ? RenderEditMulti({
        ...ctx,
        initialValue: ctx.initialValue == null ? [] : castArray(ctx.initialValue),
        option: {
          ...ctx.option,
          multi,
        },
      })
      : RenderEditOne(ctx as OptionRenderEditCtx<MediaSelectable, MediaItemNodeOption>);
  };

export default RenderMediaEdit;
type OptMulti = Omit<MediaItemNodeOption, 'multi'> & {multi: MediaItemNodeOptionMultiConfig};
type BasePartialCtx<T> = Pick<OptionRenderEditCtx<T, MediaItemNodeOption>, 'onChange'>;

export function RenderMediaItemOptionOneBase<T>( // eslint-disable-line @typescript-eslint/explicit-module-boundary-types
  init: BasePartialCtx<T> & Obj<any>,
  filterFn: (filterText: string) => T[]
) {
  let filterText = '';

  return makeComponent(`#${tplIdOne}`, {
    focusBtn: false,
    focusInput: false,
    ...init,
    get filterText() {
      return filterText;
    },
    set filterText(newText: string) {
      filterText = newText;

      const trimmed = newText?.trim();
      this.results = ((trimmed?.length ?? 0) < MediaItemNumbers.MIN_SEARCH_LENGTH)
        ? []
        : filterFn(trimmed.toLowerCase());
    },
    onBtnInit,
    onInputInit,
    onItemInit,
    onKeyup,
    results: [] as T[],
    selectItem,
    unselect,
  });
}

function RenderEditOne<T extends MediaSelectable>(
  init: OptionRenderEditCtx<T, MediaItemNodeOption> & {focusInput?: boolean;}
) {
  const reg = resolveMediaItemRegistry<T>(init.option.registry, init.otherValues)!;

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

function RenderEditMulti<T extends MediaSelectable>(
  {option, onChange, initialValue, otherValues, validation}: Required<OptionRenderEditCtx<T[], OptMulti>>
) {
  return makeComponent(`#${tplIdMulti}`, {
    add: addMulti,
    canAddAfter,
    onChange,
    option,
    otherValues,
    renderSingleInsideMulti,
    rm: multiRmAt,
    validation,
    value: initialValue!,
  });
}

type ThisMulti<T extends MediaSelectable> = ReturnType<typeof RenderEditMulti<T>>;
type This<T extends MediaSelectable> = ReturnType<typeof RenderEditOne<T>> & {
  value?: T;
};

function multiRmAt<T extends MediaSelectable>(this: ThisMulti<T>, idx: number): void {
  this.value.splice(idx, 1);
  this.onChange(this.value);
}

function renderSingleInsideMulti<T extends MediaSelectable>(
  this: ThisMulti<T>,
  idx: number,
  value: T,
  validation: NodeValidationStore
) {
  return RenderEditOne({
    focusInput: idx !== 0,
    initialValue: value,
    onChange: v => {
      this.value[idx] = v!;
      this.onChange(this.value);
    },
    option: this.option,
    otherValues: this.otherValues,
    validation,
  });
}

function addMulti<T extends MediaSelectable>(this: ThisMulti<T>): void {
  this.value.push(undefined as any);
}

function canAddAfter<T extends MediaSelectable>(this: ThisMulti<T>, idx: number): boolean {
  return idx === (this.value.length - 1) && idx < ((this.option.multi.maxLength ?? Number.MAX_VALUE) - 1);
}

function unselect<T extends MediaSelectable>(this: This<T>): void {
  this.value = undefined;
  this.focusInput = true;
  this.onChange(this.value);
}

function selectItem<T extends MediaSelectable>(this: This<T>, item: T, event: Event): void {
  event.preventDefault();
  this.filterText = '';
  this.value = item;
  this.onChange(item);

  if ((this as any).validation) {
    ((this as any).validation as NodeValidationStore).touched = true;
  }
}

function onItemInit<T extends MediaSelectable>(el: HTMLElement, item: T): void {
  tippy(el, {content: item.name});
}

function onInputInit<T extends MediaSelectable>(this: This<T>, el: HTMLElement): void {
  if (this.focusInput) {
    this.focusInput = false;
    el.focus();
  }
}

function onKeyup<T extends MediaSelectable>(this: This<T>, e: KeyboardEvent): void {
  if (e.key !== 'Enter') {
    return;
  }

  if (this.results.length) {
    this.selectItem(this.results[0], e);
  } else {
    e.preventDefault();
  }
}

function onBtnInit<T extends MediaSelectable>(this: This<T>, btn: HTMLElement): void {
  if (this.focusBtn) {
    this.focusBtn = false;
    btn.focus();
  }
}
