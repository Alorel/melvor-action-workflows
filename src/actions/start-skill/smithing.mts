import type {Smithing} from 'melvor';
import {defineAction} from '../../lib/api.mjs';
import {InternalCategory} from '../../lib/registries/action-registry.mjs';
import {SingleRecipeAction} from '../_common/single-recipe-action.mjs';

defineAction(
  SingleRecipeAction
    .new<Smithing>({
      category: InternalCategory.START_SKILL,
      localID: 'startSmithing',
      options: [
        {
          label: 'Item',
          localID: 'recipe',
          registry: ['smithing', 'actions'],
          required: true,
          type: 'MediaItem',
        },
      ],
      skillKey: 'smithing',
    })
    .exec(SingleRecipeAction.artisanExec)
);
