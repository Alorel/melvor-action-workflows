import type {Item as TItem} from 'melvor';
import {Fragment} from 'preact';
import {InternalCategory} from '../../lib/registries/action-registry.mjs';
import {defineLocalTrigger} from '../../lib/util/define-local.mjs';
import {NUM_COMPARE_ENUM, NumComparator, numCompare} from '../../lib/util/num-compare.mjs';
import {BigNum} from '../../ui/components/big-num';
import {RenderNodeMedia} from '../../ui/pages/workflows-dashboard/render-node-media';

export interface ItemQuantityTriggerData {
  comparator: NumComparator;

  item: TItem;

  qty: number;
}

const triggerCtx = defineLocalTrigger<ItemQuantityTriggerData>({
  category: InternalCategory.CORE,
  check: ({comparator, item, qty}) => numCompare(game.bank.getQty(item), comparator, qty),
  compactRender: ({comparator, item, qty}) => (
    <Fragment>
      <RenderNodeMedia label={item.name} media={item.media}/>
      <span>{` ${NUM_COMPARE_ENUM[comparator]} `}</span>
      <BigNum num={qty}/>
    </Fragment>
  ),
  init() {
    function patcher(_returnValue: any, {id}: TItem) {
      const liveQty = game.bank.getQty(game.items.getObjectByID(id));

      triggerCtx.notifyListeners(({comparator, item, qty}) => item.id === id && numCompare(liveQty, comparator, qty));
    }

    ctx.patch(Bank, 'addItem').after(patcher);
    ctx.patch(Bank, 'removeItemQuantity').after(patcher);
  },
  initOptions: () => ({comparator: NumComparator.GTE}),
  label: 'Item Quantity (bank)',
  localID: 'itemQty',
  media: game.pages.getObjectByID('melvorD:Bank')!.media,
  options: [
    {
      label: 'Item',
      localID: 'item',
      registry: 'items',
      required: true,
      type: 'MediaItem',
    },
    {
      enum: NUM_COMPARE_ENUM,
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
