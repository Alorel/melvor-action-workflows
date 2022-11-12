import type {EquipItemArgSlot, EquipmentItem as TEquipmentItem} from 'melvor';
import {EquipmentItem, EquipSlotType} from 'melvor';
import {InternalCategory} from '../../lib/registries/action-registry.mjs';
import {defineLocalAction} from '../../lib/util/define-local.mjs';

interface Props {
  items: TEquipmentItem[];

  passive?: boolean;
}

function *summoningSlots(): IterableIterator<EquipSlotType> {
  {
    const {Summon1, Summon2} = game.combat.player.equipment.slots;
    const emptyId = game.emptyEquipmentItem.id;

    if (Summon1.item.id !== emptyId && Summon2.item.id === emptyId) {
      yield EquipSlotType.Summon2;
    }
  }

  yield EquipSlotType.Summon1;
  while (true) {
    yield EquipSlotType.Summon2;
  }
}

function equipPassive(item: EquipmentItem | undefined): void {
  const player = game.combat.player;
  if (!item?.validSlots?.includes(EquipSlotType.Passive) || !player.isEquipmentSlotUnlocked(EquipSlotType.Passive)) {
    return;
  }

  const qty = game.bank.getQty(item);
  if (qty) {
    player.equipItem(item, player.equipToSet, EquipSlotType.Passive, qty);
  }
}

function equipNonPassive(items: EquipmentItem[]): void {
  const player = game.combat.player;
  const summonSlot = summoningSlots();

  for (const item of items) {
    const qty = game.bank.getQty(item);
    if (!qty) {
      continue;
    }

    const slot: EquipItemArgSlot = item.validSlots.includes(EquipSlotType.Summon1)
      ? summonSlot.next().value
      : 'Default';

    player.equipItem(item, player.equipToSet, slot, qty);
  }
}

defineLocalAction<Props>({
  category: InternalCategory.CORE,
  execute({items, passive}) {
    const player = game.combat.player;

    player.changeEquipToSet(player.selectedEquipmentSet);

    if (passive) {
      equipPassive(items[0]);
    } else {
      equipNonPassive(items);
    }
  },
  initOptions: () => ({items: [undefined as any]}),
  label: 'Equip items',
  localID: 'equipItem',
  media: game.items.getObjectByID('melvorD:Black_Platebody')!.media,
  options: [
    {
      description: 'Choose a single item with a pasive effect to be able to explicitly equip it to the passive slot.',
      label: 'Item(s)',
      localID: 'items',
      mediaFilter: item => item instanceof EquipmentItem,
      multi: true,
      registry: 'items',
      required: true,
      type: 'MediaItem',
    },
    {
      description: 'No effect if the passive slot isn\'t unlocked',
      label: 'Equip to passive slot',
      localID: 'passive',
      showIf: ({items}: Partial<Props>) => (
        items?.length === 1 && Boolean(items[0]?.validSlots?.includes(EquipSlotType.Passive))
      ),
      type: Boolean,
      uiKey: ({items}: Props) => items[0].id,
    },
  ],
});
