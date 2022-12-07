import type {Monster as TMonster} from 'melvor';
import {InternalCategory} from '../../lib/registries/action-registry.mjs';
import {defineLocalTrigger} from '../../lib/util/define-local.mjs';

interface Data {
  mob: TMonster;
}

const triggerCtx = defineLocalTrigger<Data>({
  category: InternalCategory.COMBAT,
  check: d => game.combat.isActive && game.combat.enemy.monster?.name === d.mob.id,
  init() {
    ctx.patch(CombatManager, 'spawnEnemy').after(() => {
      const mobID = game.combat.enemy.monster.id;
      triggerCtx.notifyListeners(d => d.mob.id === mobID);
    });
  },
  label: 'Monster in combat',
  localID: 'mobID',
  media: game.monsters.getObjectByID('melvorD:MalcsTheGuardianOfMelvor')!.media,
  options: [
    {
      label: 'Monster',
      localID: 'mob',
      registry: 'monsters',
      required: true,
      type: 'MediaItem',
    },
  ],
});
