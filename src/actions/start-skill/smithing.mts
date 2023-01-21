import type {Smithing} from 'melvor';
import {InternalCategory} from '../../lib/registries/action-registry.mjs';
import {defineLocalAction} from '../../lib/util/define-local.mjs';
import ActionId from '../action-id.mjs';
import {SingleRecipeAction} from '../lib/single-recipe-action.mjs';

defineLocalAction(
  SingleRecipeAction
    .new<Smithing>({
      category: InternalCategory.START_SKILL,
      id: ActionId.StartSkillSmithing,
      options: [
        {
          id: 'recipe',
          label: 'Item',
          registry: ['smithing', 'actions'],
          required: true,
          type: 'MediaItem',
        },
      ],
      skillKey: 'smithing',
    })
    .exec(SingleRecipeAction.artisanExec)
);
