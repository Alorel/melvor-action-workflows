import type {Skill, SkillWithMastery as TSkillWithMastery} from 'melvor';
import {InternalCategory} from '../lib/registries/action-registry.mjs';
import {defineLocalTrigger} from '../lib/util/define-local.mjs';

interface Data<T> {
  level: number;

  recipe: T;

  skill: TSkillWithMastery<T>;
}

const triggerCtx = defineLocalTrigger<Data<any>>({
  category: InternalCategory.CORE,
  check: ({level, recipe, skill}) => (skill.actionMastery.get(recipe)?.level ?? -1) >= level,
  init() {
    ctx.patch(SkillWithMastery, 'onMasteryLevelUp').after(function () {
      triggerCtx.notifyListeners();
    });
  },
  label: 'Mastery level',
  localID: 'masteryLvl',
  media: cdnMedia('assets/media/main/mastery_header.svg'),
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
      label: 'Recipe',
      localID: 'recipe',
      registry: ({skill}: Data<any>) => [skill?.localID.toLowerCase(), 'actions'],
      required: true,
      showIf: ({skill}: Data<any>) => Boolean(skill),
      type: 'MediaItem',
    },
    {
      label: 'Level',
      localID: 'level',
      max: ({skill}: Partial<Data<any>>) => Math.max(99, skill?.masteryLevelCap ?? 0), // eslint-disable-line @typescript-eslint/no-magic-numbers
      min: 2,
      required: true,
      type: Number,
    },
  ],
});
