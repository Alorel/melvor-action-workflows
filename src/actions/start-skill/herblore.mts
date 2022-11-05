import type {Herblore} from 'melvor';
import {defineAction} from '../../lib/api.mjs';
import {InternalCategory} from '../../lib/registries/action-registry.mjs';
import {SingleRecipeAction} from '../_common/single-recipe-action.mjs';

defineAction(
  SingleRecipeAction
    .new<Herblore>({
      category: InternalCategory.START_SKILL,
      localID: 'startHerblore',
      options: [
        {
          label: 'Item',
          localID: 'recipe',
          registry: ['herblore', 'actions'],
          required: true,
          type: 'MediaItem',
        },
      ],
      skillKey: 'herblore',
    })
    .exec(SingleRecipeAction.artisanExec)
);
