import type {FoodItem as TFoodItem} from 'melvor';
import {InternalCategory} from '../../lib/registries/action-registry.mjs';
import {defineLocalTrigger} from '../../lib/util/define-local.mjs';
import {NUM_COMPARE_ENUM, NumComparator, numCompare} from '../../lib/util/num-compare.mjs';
import TriggerId from '../trigger-id.mjs';
import {EquippedItemCountCompactRender} from './equipped-item-count';

interface Data {
  comparator: NumComparator;

  item: TFoodItem;

  qty: number;
}

function check({comparator, item, qty}: Data): boolean {
  for (const slot of game.combat.player.food.slots) {
    if (slot.item === item && numCompare(slot.quantity, comparator, qty)) {
      return true;
    }
  }

  return false;
}

const triggerCtx = defineLocalTrigger<Data>({
  category: InternalCategory.CORE,
  check,
  compactRender: EquippedItemCountCompactRender,
  id: TriggerId.CoreEquippedFoodCount,
  init() {
    function patch() {
      triggerCtx.notifyListeners(check);
    }

    ctx.patch(EquippedFood, 'consume').after(patch);
    ctx.patch(EquippedFood, 'equip').after(patch);
    ctx.patch(EquippedFood, 'unequipSelected').after(patch);
  },
  initOptions: () => ({comparator: NumComparator.GTE}),
  label: 'Equipped Food Quantity',
  media: game.items.getObjectByID('melvorD:Beef_Pie')!.media,
  options: [
    {
      id: 'item',
      label: 'Item',
      mediaFilter: item => item instanceof FoodItem,
      registry: 'items',
      required: true,
      type: 'MediaItem',
    },
    {
      enum: NUM_COMPARE_ENUM,
      id: 'comparator',
      label: 'Comparator',
      required: true,
      type: String,
    },
    {
      id: 'qty',
      label: 'Quantity',
      min: 0,
      required: true,
      type: Number,
    },
  ],
});
