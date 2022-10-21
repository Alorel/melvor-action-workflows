import type {Skill as TSkill} from 'melvor';
import {defineLocalTrigger} from '../lib/define-local.mjs';
import {InternalCategory} from '../lib/registries/action-registry.mjs';
import {InternalTriggerId} from '../lib/registries/trigger-registry.mjs';
import {debugLog} from '../lib/util/log.mjs';

export interface LevelGainedTriggerData {
  level: number;

  skill: TSkill;
}

const triggerCtx = defineLocalTrigger<LevelGainedTriggerData>({
  category: InternalCategory.CORE,
  enabled() {
    ctx.patch(Skill, 'onLevelUp').after(function (this: TSkill): void {
      const leveledSkill = this.id;
      const levelReached = this.level;

      debugLog(leveledSkill, 'leveled up to', levelReached, '- notifying level gained trigger subscribers');

      triggerCtx.notifyListeners(({level, skill}) => level <= levelReached && skill.id === leveledSkill);
    });

    triggerCtx.notifyListeners(({level, skill}) => skill.level >= level);
  },
  label: 'Level gained',
  localID: InternalTriggerId.LEVEL_GAINED,
  options: [
    {
      label: 'Skill',
      localID: 'skill',
      registry: 'skills',
      required: true,
      type: 'MediaItem',
    },
    {
      label: 'Level',
      localID: 'level',
      max: Math.max(...[...game.skills.registeredObjects.values()].map(s => s.levelCap ?? 0)),
      min: 2,
      required: true,
      type: Number,
    },
  ],
});
