import type {Firemaking} from 'melvor';
import {defineAction} from '../../lib/api.mjs';
import {InternalCategory} from '../../lib/registries/action-registry.mjs';
import {SingleRecipeAction} from '../_common/single-recipe-action.mjs';

defineAction(
  SingleRecipeAction
    .new<Firemaking>({
      category: InternalCategory.START_SKILL,
      localID: 'startFiremaking',
      options: [
        {
          label: 'Logs',
          localID: 'recipe',
          registry: ['firemaking', 'actions'],
          required: true,
          type: 'MediaItem',
        },
      ],
      skillKey: 'firemaking',
    })
    .exec(function startFiremakingExec({recipe}) {
      if (!this.skill.isActive || this.skill.selectedRecipe?.id !== recipe.id) {
        this.skill.selectLog(recipe);
        this.skill.burnLog();
      }
    })
);
