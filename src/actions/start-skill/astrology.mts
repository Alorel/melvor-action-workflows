import type {Astrology} from 'melvor';
import {InternalCategory} from '../../lib/registries/action-registry.mjs';
import {defineLocalAction} from '../../lib/util/define-local.mjs';
import ActionId from '../action-id.mjs';
import {SingleRecipeAction} from '../lib/single-recipe-action.mjs';

defineLocalAction(
  SingleRecipeAction
    .new<Astrology>({
      category: InternalCategory.START_SKILL,
      id: ActionId.StartSkillAstrology,
      options: [
        {
          id: 'recipe',
          label: 'Constellation',
          registry: ['astrology', 'actions'],
          required: true,
          type: 'MediaItem',
        },
      ],
      skillKey: 'astrology',
    })
    .exec(function startAstroExec({recipe}) {
      this.skill.studyConstellationOnClick(recipe);
    })
);
