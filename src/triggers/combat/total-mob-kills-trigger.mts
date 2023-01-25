import type {Monster} from 'melvor';
import {InternalCategory} from '../../lib/registries/action-registry.mjs';
import {defineLocalTrigger} from '../../lib/util/define-local.mjs';
import TriggerId from '../trigger-id.mjs';

interface Data {
  mob: Monster;

  num: number;
}

function check({mob, num}: Data): boolean {
  return game.stats.monsterKillCount(mob) >= num;
}

const triggerCtx = defineLocalTrigger<Data>({
  category: InternalCategory.COMBAT,
  check,
  id: TriggerId.CombatTotalMobKills,
  init() {
    ctx.patch(CombatManager, 'onEnemyDeath').after(() => {
      triggerCtx.notifyListeners(check);
    });
  },
  label: 'Total mob kills',
  media: game.monsters.getObjectByID('melvorD:Golbin')!.media,
  options: [
    {
      id: 'mob',
      label: 'Monster',
      registry: 'monsters',
      required: true,
      type: 'MediaItem',
    },
    {
      description: 'This is the TOTAL count, not a per-workflow-run count',
      id: 'num',
      label: 'Count',
      min: 0,
      required: true,
      type: Number,
    },
  ],
});
