import type {Item as TItem} from 'melvor';
import {defineLocalTrigger} from '../lib/define-local.mjs';
import {InternalCategory} from '../lib/registries/action-registry.mjs';
import {InternalTriggerId} from '../lib/registries/trigger-registry.mjs';

type Comparator = '>=' | '<=';

export interface ItemQuantityTriggerData {
  comparator: Comparator;

  item: TItem;

  qty: number;
}

function is(lhs: number, comp: Comparator, rhs: number): boolean {
  return comp === '>=' ? lhs >= rhs : lhs <= rhs;
}

const triggerCtx = defineLocalTrigger<ItemQuantityTriggerData>({
  category: InternalCategory.CORE,
  enabled() {
    function patcher(_returnValue: any, {id}: TItem) {
      const liveQty = game.bank.getQty(game.items.getObjectByID(id));

      triggerCtx.notifyListeners(({comparator, item, qty}) => item.id === id && is(liveQty, comparator, qty));
    }

    ctx.patch(Bank, 'addItem').after(patcher);
    ctx.patch(Bank, 'removeItemQuantity').after(patcher);

    triggerCtx.notifyListeners(({comparator, item, qty}) => (
      is(game.bank.getQty(item), comparator, qty)
    ));
  },
  initOptions: () => ({comparator: '>='}),
  label: 'Item Quantity',
  localID: InternalTriggerId.ITEM_QTY,
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
        '>=': '≥',
        '<=': '≤',
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
