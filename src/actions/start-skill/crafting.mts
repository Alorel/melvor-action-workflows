import type {Crafting} from 'melvor';
import {defineAction} from '../../lib/api.mjs';
import {InternalCategory} from '../../lib/registries/action-registry.mjs';
import {SingleRecipeAction} from '../lib/single-recipe-action.mjs';

defineAction(
  SingleRecipeAction
    .new<Crafting>({
      category: InternalCategory.START_SKILL,
      localID: 'startCrafting',
      options: [
        {
          label: 'Item',
          localID: 'recipe',
          registry: ['crafting', 'actions'],
          required: true,
          type: 'MediaItem',
        },
      ],
      skillKey: 'crafting',
    })
    .exec(SingleRecipeAction.artisanExec)
);
