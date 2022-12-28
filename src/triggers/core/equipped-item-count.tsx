import type {EquipmentItem as TEquipmentItem} from 'melvor';
import {Fragment} from 'preact';
import {InternalCategory} from '../../lib/registries/action-registry.mjs';
import {defineLocalTrigger} from '../../lib/util/define-local.mjs';
import {NUM_COMPARE_ENUM, NumComparator, numCompare} from '../../lib/util/num-compare.mjs';
import {BigNum} from '../../ui/components/big-num';
import {RenderNodeMedia} from '../../ui/pages/workflows-dashboard/render-node-media';

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
  compactRender: ({comparator, item, qty}) => (
    <Fragment>
      <span>{`${NUM_COMPARE_ENUM[comparator]} `}</span>
      <BigNum num={qty}/>
      <span>{' '}</span>
      <RenderNodeMedia label={item.name} media={item.media}/>
      <span>{' equipped'}</span>
    </Fragment>
  ),
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
  localID: 'equippedQty',
  media: cdnMedia('assets/media/bank/armour_helmet.png'),
  options: [
    {
      label: 'Item',
      localID: 'item',
      mediaFilter: item => item instanceof EquipmentItem,
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
