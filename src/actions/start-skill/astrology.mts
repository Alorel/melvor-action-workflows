import type {Astrology} from 'melvor';
import {defineAction} from '../../lib/api.mjs';
import {InternalCategory} from '../../lib/registries/action-registry.mjs';
import {SingleRecipeAction} from '../lib/single-recipe-action.mjs';

defineAction(
  SingleRecipeAction
    .new<Astrology>({
      category: InternalCategory.START_SKILL,
      localID: 'startAstro',
      options: [
        {
          label: 'Constellation',
          localID: 'recipe',
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
