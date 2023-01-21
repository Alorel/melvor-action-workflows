import {InternalCategory} from '../../lib/registries/action-registry.mjs';
import {defineLocalAction} from '../../lib/util/define-local.mjs';
import ActionId from '../action-id.mjs';

interface Props {
  set: number;
}

defineLocalAction<Props>({
  category: InternalCategory.CORE,
  execute({set}) {
    game.combat.player.changeEquipmentSet(set);
  },
  id: ActionId.CoreSwitchEquipmentSets,
  initOptions: () => ({set: 0}),
  label: 'Equip set',
  media: game.items.getObjectByID('melvorD:Black_Platebody_T_G')!.media,
  options: [
    {
      id: 'set',
      label: 'Set',
      required: true,
      type: 'EquipmentSet',
    },
  ],
});
