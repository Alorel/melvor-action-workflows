import type {EquipItemArgSlot, EquipmentItem as TEquipmentItem} from 'melvor';
import {EquipSlotType} from 'melvor';
import {InternalCategory} from '../../lib/registries/action-registry.mjs';
import {defineLocalAction} from '../../lib/util/define-local.mjs';

interface Props {
  items: TEquipmentItem[];

  passive?: boolean;
}

function *summoningSlots(): IterableIterator<EquipSlotType> {
  yield EquipSlotType.Summon1;
  while (true) {
    yield EquipSlotType.Summon2;
  }
}

defineLocalAction<Props>({
  category: InternalCategory.CORE,
  execute({items, passive}) {
    const player = game.combat.player;

    player.changeEquipToSet(player.selectedEquipmentSet);

    if (passive) {
      const item = items[0];
      if (item?.validSlots?.includes(EquipSlotType.Passive) && player.isEquipmentSlotUnlocked(EquipSlotType.Passive)) {
        const qty = game.bank.getQty(item);
        if (qty) {
          player.equipItem(item, player.equipToSet, EquipSlotType.Passive, qty);
        }
      }

      return;
    }

    const baseSlot: EquipItemArgSlot = 'Default';
    const summonSlot = summoningSlots();

    for (const item of items) {
      const qty = game.bank.getQty(item);
      if (qty) {
        const slot = item.validSlots.includes(EquipSlotType.Summon1)
          ? summonSlot.next().value as EquipSlotType
          : baseSlot;

        player.equipItem(item, player.equipToSet, slot, qty);
      }
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
      uiKey: ({items}: Props) => items[0]?.id ?? '',
    },
  ],
});
