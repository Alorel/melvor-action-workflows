import type {Skill, SkillWithMastery as TSkillWithMastery} from 'melvor';
import {InternalCategory} from '../../lib/registries/action-registry.mjs';
import {defineLocalTrigger} from '../../lib/util/define-local.mjs';

interface Data {
  pool: number;

  skill: TSkillWithMastery<any>;
}

const triggerCtx = defineLocalTrigger<Data>({
  category: InternalCategory.CORE,
  check: ({pool, skill}) => skill.masteryPoolProgress >= pool,
  init() {
    ctx.patch(SkillWithMastery, 'addMasteryPoolXP').after(function () {
      triggerCtx.notifyListeners();
    });
  },
  label: 'Mastery pool %',
  localID: 'masteryPool',
  media: cdnMedia('assets/media/main/mastery_pool.svg'),
  options: [
    {
      label: 'Skill',
      localID: 'skill',
      mediaFilter: (skill: Skill) => skill.hasMastery,
      registry: 'skills',
      required: true,
      type: 'MediaItem',
    },
    {
      label: '%',
      localID: 'pool',
      max: ({skill}: Partial<Data>) => Math.max(125, skill?.masteryPoolCapPercent ?? 0), // eslint-disable-line @typescript-eslint/no-magic-numbers
      min: 0,
      required: true,
      step: 0.01,
      type: Number,
    },
  ],
});
