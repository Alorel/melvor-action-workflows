import type {Item as TItem} from 'melvor';
import {InternalCategory} from '../lib/registries/action-registry.mjs';
import {defineLocalTrigger} from '../lib/util/define-local.mjs';

const enum Comparator {
  GTE = '>=',
  LTE = '<=',
}

export interface ItemQuantityTriggerData {
  comparator: Comparator;

  item: TItem;

  qty: number;
}

function compare(lhs: number, comp: Comparator, rhs: number): boolean {
  return comp === Comparator.GTE ? lhs >= rhs : lhs <= rhs;
}

const triggerCtx = defineLocalTrigger<ItemQuantityTriggerData>({
  category: InternalCategory.CORE,
  check: ({comparator, item, qty}) => compare(game.bank.getQty(item), comparator, qty),
  init() {
    function patcher(_returnValue: any, {id}: TItem) {
      const liveQty = game.bank.getQty(game.items.getObjectByID(id));

      triggerCtx.notifyListeners(({comparator, item, qty}) => item.id === id && compare(liveQty, comparator, qty));
    }

    ctx.patch(Bank, 'addItem').after(patcher);
    ctx.patch(Bank, 'removeItemQuantity').after(patcher);
  },
  initOptions: () => ({comparator: Comparator.GTE}),
  label: 'Item Quantity',
  localID: 'itemQty',
  media: game.pages.getObject('melvorD', 'Bank')!.media,
  options: [
    {
      label: 'Item',
      localID: 'item',
      registry: 'items',
      required: true,
      type: 'MediaItem',
    },
    {
      enum: {
        /* eslint-disable sort-keys */
        [Comparator.GTE]: '≥',
        [Comparator.LTE]: '≤',
        /* eslint-enable sort-keys */
      },
      label: 'Comparator',
      localID: 'comparator',
      required: true,
      type: String,
    },
    {
      label: 'Quantity',
      localID: 'qty',
      min: 0,
      required: true,
      type: Number,
    },
  ],
});
