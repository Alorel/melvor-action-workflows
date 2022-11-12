import type {Astrology} from 'melvor';
import {defineAction} from '../../lib/api.mjs';
import {InternalCategory} from '../../lib/registries/action-registry.mjs';
import {SingleRecipeAction} from '../_common/single-recipe-action.mjs';

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
      if (!this.skill.isActive || this.skill.activeConstellation?.id !== recipe.id) {
        this.skill.studyConstellationOnClick(recipe);
      }
    })
);
