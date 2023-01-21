import type {EquipmentItem as TEquipmentItem} from 'melvor';
import type {VNode} from 'preact';
import {Fragment} from 'preact';
import {InternalCategory} from '../../lib/registries/action-registry.mjs';
import {defineLocalTrigger} from '../../lib/util/define-local.mjs';
import {NUM_COMPARE_ENUM, NumComparator, numCompare} from '../../lib/util/num-compare.mjs';
import {BigNum} from '../../ui/components/big-num';
import {RenderNodeMedia} from '../../ui/pages/workflows-dashboard/render-node-media';
import TriggerId from '../trigger-id.mjs';

interface Data {
  comparator: NumComparator;

  item: TEquipmentItem;

  qty: number;
}

function check({comparator, item, qty}: Data): boolean {
  const eq = game.combat.player.equipment;
  const slot = eq.slotMap.get(item);

  return slot != null && numCompare(eq.slots[slot].quantity, comparator, qty);
}

const triggerCtx = defineLocalTrigger<Data>({
  category: InternalCategory.CORE,
  check,
  compactRender: EquippedItemCountCompactRender,
  id: TriggerId.CoreEquippedItemCount,
  init() {
    function patch() {
      triggerCtx.notifyListeners(check);
    }

    ctx.patch(Equipment, 'addQuantityToSlot').after(patch);
    ctx.patch(Equipment, 'removeQuantityFromSlot').after(patch);
    ctx.patch(Player, 'equipItem').after(patch);
    ctx.patch(Player, 'unequipItem').after(patch);
  },
  initOptions: () => ({comparator: NumComparator.GTE}),
  label: 'Item Quantity (equipped)',
  media: cdnMedia('assets/media/bank/armour_helmet.png'),
  options: [
    {
      id: 'item',
      label: 'Item',
      mediaFilter: item => item instanceof EquipmentItem,
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

export function EquippedItemCountCompactRender({comparator, item, qty}: Data): VNode {
  return (
    <Fragment>
      <span>{`${NUM_COMPARE_ENUM[comparator]} `}</span>
      <BigNum num={qty}/>
      <span>{' '}</span>
      <RenderNodeMedia label={item.name} media={item.media}/>
      <span>{' equipped'}</span>
    </Fragment>
  );
}
