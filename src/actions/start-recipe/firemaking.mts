import type {Firemaking} from 'melvor';
import {defineAction} from '../../lib/api.mjs';
import {InternalActionId, InternalCategory} from '../../lib/registries/action-registry.mjs';
import {SingleRecipeAction} from '../common/single-recipe-action.mjs';

defineAction(
  SingleRecipeAction
    .new<Firemaking>({
      category: InternalCategory.CRAFTING,
      label: 'Burn logs',
      localID: InternalActionId.FIREMAKING,
      options: [
        {
          label: 'Logs',
          localID: 'recipe',
          registry: 'firemaking.actions',
          required: true,
          type: 'MediaItem',
        },
      ],
      skillKey: 'firemaking',
    })
    .exec(function startFiremakingExec({recipe}) {
      this.skill.selectLog(recipe);
      this.skill.burnLog();
    })
);
