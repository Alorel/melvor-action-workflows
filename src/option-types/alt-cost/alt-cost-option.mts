import type {BasicSkillRecipe, Item} from 'melvor';
import {defineOption} from '../../lib/api.mjs';
import type {AltRecipeCostNodeOption, OptionRenderViewCtx} from '../../public_api';
import {findItems, MediaItemOption, RenderMediaItemOptionOneBase} from '../media-item/media-item-option.mjs';

defineOption<number, AltRecipeCostNodeOption>({
  is: (v): v is AltRecipeCostNodeOption => (
    v.type === 'AltRecipeCost'
    && typeof v.recipeOption === 'string'
    && typeof v.getAltCostItems === 'function'
  ),
  renderEdit(init) {
    const recipe: BasicSkillRecipe | undefined = init.otherValues[init.option.recipeOption];
    const selectableItems: Item[] = (recipe && init.option.getAltCostItems(recipe)) || [];

    let idx = init.initialValue;

    const base = RenderMediaItemOptionOneBase<Item>(
      {
        ...init,
        onChange(newVal) {
          if (!newVal) {
            return init.onChange();
          }

          const newId = newVal.id;
          const valIdx = selectableItems.findIndex(v => v.id === newId);
          init.onChange(valIdx === -1 ? undefined : valIdx);
        },
      },
      filterText => [...findItems({
        optionValues: init.otherValues,
        query: filterText,
        source: selectableItems,
      })]
    );
    Object.defineProperty(base, 'value', {
      configurable: true,
      enumerable: true,
      get() {
        return selectableItems[idx ?? -1];
      },
      set(item: Item) {
        if (!item) {
          return;
        }

        const itemId = item.id;
        const tmpIdx = selectableItems.findIndex(i => i.id === itemId);
        idx = tmpIdx === -1 ? undefined : tmpIdx;
      },
    });

    return base;
  },
  renderView({value, option: {getAltCostItems, recipeOption}, otherValues}) {
    if (value == null || value === -1) {
      return {};
    }

    const recipe: BasicSkillRecipe | undefined = otherValues[recipeOption];
    if (!recipe) {
      return {};
    }

    const altCostItem = getAltCostItems(recipe)?.[value];
    if (!altCostItem) {
      return {};
    }

    const ctx: Partial<OptionRenderViewCtx<Item, any>> = {value: altCostItem};

    return MediaItemOption.renderView(ctx as OptionRenderViewCtx<Item, any>);
  },
  token: 'AltRecipeCost',
});
