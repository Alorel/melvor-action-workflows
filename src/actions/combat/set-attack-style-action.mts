import {AwesomeIter} from '@aloreljs/awesome-iter';
import {reduce} from '@aloreljs/awesome-iter/consumers';
import type {AttackStyle as TAttackStyle} from 'melvor';
import {InternalCategory} from '../../lib/registries/action-registry.mjs';
import {defineLocalAction} from '../../lib/util/define-local.mjs';
import type {Obj} from '../../public_api';
import ActionId from '../action-id.mjs';

interface Props {
  style: string;
}

defineLocalAction<Props>({
  category: InternalCategory.COMBAT,
  execute({style: id}) {
    const player = game.combat.player;
    const style = game.attackStyles.getObjectByID(id)!;

    player.setAttackStyle(style.attackType, style);
  },
  id: ActionId.CombatSetAttackStyle,
  label: 'Set attack style',
  media: game.attack.media,
  options: [
    {
      enum: new AwesomeIter(game.attackStyles.registeredObjects.values())
        .consume(reduce<TAttackStyle, Obj<string>>({}, (acc, style) => {
          acc[style.id] = style.name;

          return acc;
        })),
      id: 'style',
      label: 'Style',
      required: true,
      type: String,
    },
  ],
});
