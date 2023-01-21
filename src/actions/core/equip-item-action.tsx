import type {EquipmentItem as TEquipmentItem} from 'melvor';
import {EquipSlotType} from 'melvor';
import {Fragment} from 'preact';
import {InternalCategory} from '../../lib/registries/action-registry.mjs';
import {defineLocalAction} from '../../lib/util/define-local.mjs';
import {BigNum} from '../../ui/components/big-num';
import {RenderNodeMedia} from '../../ui/pages/workflows-dashboard/render-node-media';
import ActionId from '../action-id.mjs';

interface Props {
  item: TEquipmentItem;

  qty?: number;

  slot?: EquipSlotType;
}

defineLocalAction<Props>({
  category: InternalCategory.CORE,
  compactRender: ({item, qty, slot}) => (
    <Fragment>
      <span>{'Equip '}</span>
      {qty != null && (
        <Fragment>
          <BigNum num={qty}/>
          <span>{' '}</span>
        </Fragment>
      )}
      <RenderNodeMedia label={item.name} media={item.media}/>
      {slot && (
        <Fragment>
          <span>{' to '}</span>
          <span class={'text-primary'}>{slot}</span>
        </Fragment>
      )}
    </Fragment>
  ),
  execute({item, qty, slot}) {
    const bankQty = game.bank.getQty(item);
    if (!bankQty) {
      return;
    }

    const player = game.combat.player;
    player.changeEquipToSet(player.selectedEquipmentSet);
    player.equipItem(item, player.equipToSet, slot || 'Default', qty ?? bankQty);
  },
  id: ActionId.CoreEquipItem,
  label: 'Equip item',
  media: game.items.getObjectByID('melvorD:Black_Platebody')!.media,
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
      description: 'Leave empty to use the item\'s default, e.g. a ring with a passive effect would get equipped to the ring slot. If you\'re equipping two summons, specify the slot for each.',
      enum: ({item}: Props) => objectFromArray(item.validSlots),
      id: 'slot',
      label: 'Slot',
      showIf: ({item}: Partial<Props>) => (item?.validSlots?.length ?? 0) > 1,
      type: String,
    },
    {
      description: 'Equips however much you have in the bank if unspecified & supported.',
      id: 'qty',
      label: 'Quantity',
      min: 1,
      showIf: ({item}: Partial<Props>) => SLOTS_WITH_QTY.has(item?.validSlots[0] as EquipSlotType),
      type: Number,
    },
  ],
});

function objectFromArray<T extends string>(values: T[]): Record<T, T> {
  const out: Record<T, T> = {} as any;
  for (const v of values) {
    out[v] = v;
  }

  return out;
}

const SLOTS_WITH_QTY = new Set<EquipSlotType>([
  EquipSlotType.Consumable,
  EquipSlotType.Quiver,
  EquipSlotType.Summon1,
  EquipSlotType.Summon2,
]);
