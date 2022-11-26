import type {Skill as TSkill} from 'melvor';
import {InternalCategory} from '../lib/registries/action-registry.mjs';
import {defineLocalTrigger} from '../lib/util/define-local.mjs';

export interface LevelGainedTriggerData {
  level: number;

  skill: TSkill;
}

const triggerCtx = defineLocalTrigger<LevelGainedTriggerData>({
  category: InternalCategory.CORE,
  check: ({level, skill}) => skill.level >= level,
  init() {
    ctx.patch(Skill, 'onLevelUp').after(function (this: TSkill): void {
      triggerCtx.notifyListeners();
    });
  },
  label: 'Level gained',
  localID: 'lvGained',
  media: game.pages.getObject('melvorD', 'Statistics')!.media,
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
      max: ({skill}: Partial<LevelGainedTriggerData>) => skill?.levelCap ?? 99, // eslint-disable-line @typescript-eslint/no-magic-numbers
      min: 2,
      required: true,
      type: Number,
    },
  ],
});
