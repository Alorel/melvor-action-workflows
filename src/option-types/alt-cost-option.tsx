import type {BasicSkillRecipe, Item} from 'melvor';
import {h} from 'preact';
import {useCallback} from 'preact/hooks';
import type {OptionRenderViewCtx} from '../lib/define-option.mjs';
import {defineOption} from '../lib/define-option.mjs';
import {EMPTY_ARR, EMPTY_OBJ} from '../lib/util.mjs';
import type {AltRecipeCostNodeOption, MediaSelectable, Obj} from '../public_api';
import type {MediaOptionValue} from './media-item-option.mjs';
import RenderMediaItemOptionOneBase from './media-item/media-edit-base';
import {findItems} from './media-item/render-media-commons.mjs';
import RenderMediaSelectView from './media-item/render-media-view';

defineOption<number, AltRecipeCostNodeOption>({
  is(v): v is AltRecipeCostNodeOption {
    const {type, recipeOption, getAltCostItems} = v as Partial<AltRecipeCostNodeOption>;

    return type === 'AltRecipeCost'
      && typeof recipeOption === 'string'
      && typeof getAltCostItems === 'function';
  },
  renderEdit({
    otherValues,
    option,
    value,
    onChange: origOnChange,
  }) {
    const recipe: BasicSkillRecipe | undefined = otherValues[option.recipeOption];
    const selectableItems: Item[] = (recipe && option.getAltCostItems(recipe)) || EMPTY_ARR;

    const onChange = useCallback((newVal?: MediaOptionValue): void => {
      if (!newVal) {
        return origOnChange();
      }

      const newId = (newVal as MediaSelectable).id;
      const valIdx = selectableItems.findIndex(v => v.id === newId);
      origOnChange(valIdx === -1 ? undefined : valIdx);
    }, [selectableItems, origOnChange]);

    const filterFn = useCallback((filterText: string) => [...findItems({
      optionValues: otherValues,
      query: filterText,
      source: selectableItems,
    })], [selectableItems, otherValues]);

    return (
      <RenderMediaItemOptionOneBase value={selectableItems[value ?? -1]}
        filterFn={filterFn}
        onChange={onChange}/>
    );
  },
  renderView({value, option: {getAltCostItems, recipeOption}, otherValues}) {
    if (value == null || value === -1) {
      return null;
    }

    const recipe: BasicSkillRecipe | undefined = otherValues[recipeOption];
    if (!recipe) {
      return null;
    }

    const altCostItem = getAltCostItems(recipe)?.[value];
    if (!altCostItem) {
      return null;
    }

    const ctx: Partial<OptionRenderViewCtx<Item, any>> = {
      option: EMPTY_OBJ,
      value: altCostItem,
    };

    return h(RenderMediaSelectView, ctx as OptionRenderViewCtx<Item, any>);
  },
  token: 'AltRecipeCost',
  validate(
    value: number | undefined,
    {recipeOption, getAltCostItems}: AltRecipeCostNodeOption,
    values: Obj<any>
  ): string[] {
    if (value == null) {
      return EMPTY_ARR;
    } else if (value < 0) {
      return [`Invalid idx: ${value}`];
    }

    const mainRecipe = values[recipeOption];
    if (mainRecipe == null) {
      return EMPTY_ARR;
    }

    const options = getAltCostItems(mainRecipe);

    return value < (options?.length ?? Number.NEGATIVE_INFINITY)
      ? EMPTY_ARR
      : [`Out of bounds. Max idx: ${options!.length}`];
  },
});
