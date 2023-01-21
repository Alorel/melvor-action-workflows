import type {Skill, SkillWithMastery as TSkillWithMastery} from 'melvor';
import {InternalCategory} from '../../lib/registries/action-registry.mjs';
import {defineLocalTrigger} from '../../lib/util/define-local.mjs';
import TriggerId from '../trigger-id.mjs';

interface Data<T> {
  level: number;

  recipe: T;

  skill: TSkillWithMastery<T>;
}

const triggerCtx = defineLocalTrigger<Data<any>>({
  category: InternalCategory.CORE,
  check: ({level, recipe, skill}) => (skill.actionMastery.get(recipe)?.level ?? -1) >= level,
  id: TriggerId.CoreMasteryLevel,
  init() {
    ctx.patch(SkillWithMastery, 'onMasteryLevelUp').after(function () {
      triggerCtx.notifyListeners();
    });
  },
  label: 'Mastery level',
  media: cdnMedia('assets/media/main/mastery_header.svg'),
  options: [
    {
      id: 'skill',
      label: 'Skill',
      mediaFilter: (skill: Skill) => skill.hasMastery,
      registry: 'skills',
      required: true,
      resets: ['recipe'],
      type: 'MediaItem',
    },
    {
      id: 'recipe',
      label: 'Recipe',
      registry: ({skill}: Data<any>) => [skill?.localID.toLowerCase(), 'actions'],
      required: true,
      showIf: ({skill}: Data<any>) => Boolean(skill),
      type: 'MediaItem',
    },
    {
      id: 'level',
      label: 'Level',
      max: ({skill}: Partial<Data<any>>) => Math.max(99, skill?.masteryLevelCap ?? 0), // eslint-disable-line @typescript-eslint/no-magic-numbers
      min: 2,
      required: true,
      type: Number,
    },
  ],
});
