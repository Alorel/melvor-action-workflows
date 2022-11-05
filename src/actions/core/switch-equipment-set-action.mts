import {InternalCategory} from '../../lib/registries/action-registry.mjs';
import {defineLocalAction} from '../../lib/util/define-local.mjs';

interface Props {
  set: number;
}

defineLocalAction<Props>({
  category: InternalCategory.CORE,
  execute({set}) {
    game.combat.player.changeEquipmentSet(set);
  },
  initOptions: () => ({set: 0}),
  label: 'Equip set',
  localID: 'equipSet',
  media: game.items.getObjectByID('melvorD:Black_Platebody_T_G')!.media,
  options: [
    {
      label: 'Set',
      localID: 'set',
      required: true,
      type: 'EquipmentSet',
    },
  ],
});
