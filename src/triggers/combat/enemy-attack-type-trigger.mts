import {upperFirst} from 'lodash-es';
import type {Enemy} from 'melvor';
import {InternalCategory} from '../../lib/registries/action-registry.mjs';
import {defineLocalTrigger} from '../../lib/util/define-local.mjs';
import type {Obj} from '../../public_api';

interface Data {
  type: Enemy['attackType'];
}

const triggerCtx = defineLocalTrigger<Data>({
  category: InternalCategory.COMBAT,
  check: d => game.combat.isActive && game.combat.enemy.attackType === d.type,
  init() {
    ctx.patch(CombatManager, 'spawnEnemy').after(() => {
      const ty = game.combat.enemy.attackType;
      triggerCtx.notifyListeners(d => d.type === ty);
    });
  },
  initOptions: () => ({type: AttackTypeID[AttackTypeID.melee] as Enemy['attackType']}),
  label: 'Monster attack type in combat',
  localID: 'mobAtkType',
  media: cdnMedia('assets/media/skills/combat/combat.svg'),
  options: [
    {
      enum: [AttackTypeID.melee, AttackTypeID.magic, AttackTypeID.ranged]
        .reduce<Obj<string>>(
          (acc, id) => {
            const val = AttackTypeID[id] as Enemy['attackType'];
            acc[val] = upperFirst(val);

            return acc;
          },
          {}
        ),
      label: 'Type',
      localID: 'type',
      required: true,
      type: String,
    },
  ],
});
