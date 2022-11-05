import type {Runecrafting} from 'melvor';
import {defineAction} from '../../lib/api.mjs';
import {InternalCategory} from '../../lib/registries/action-registry.mjs';
import {SingleRecipeAction} from '../_common/single-recipe-action.mjs';

defineAction(
  SingleRecipeAction
    .new<Runecrafting>({
      category: InternalCategory.START_SKILL,
      localID: 'startRC',
      options: [
        {
          label: 'Item',
          localID: 'recipe',
          registry: ['runecrafting', 'actions'],
          required: true,
          type: 'MediaItem',
        },
      ],
      skillKey: 'runecrafting',
    })
    .exec(SingleRecipeAction.artisanExec)
);
