import type {Monster as TMonster} from 'melvor';
import {InternalCategory} from '../../lib/registries/action-registry.mjs';
import {defineLocalTrigger} from '../../lib/util/define-local.mjs';
import TriggerId from '../trigger-id.mjs';

interface Data {
  mob: TMonster;
}

const triggerCtx = defineLocalTrigger<Data>({
  category: InternalCategory.COMBAT,
  check: d => game.combat.isActive && game.combat.enemy.monster?.name === d.mob.id,
  id: TriggerId.CombatEnemyId,
  init() {
    ctx.patch(CombatManager, 'spawnEnemy').after(() => {
      const mobID = game.combat.enemy.monster.id;
      triggerCtx.notifyListeners(d => d.mob.id === mobID);
    });
  },
  label: 'Monster in combat',
  media: game.monsters.getObjectByID('melvorD:MalcsTheGuardianOfMelvor')!.media,
  options: [
    {
      id: 'mob',
      label: 'Monster',
      registry: 'monsters',
      required: true,
      type: 'MediaItem',
    },
  ],
});
