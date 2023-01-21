import type {Runecrafting} from 'melvor';
import {InternalCategory} from '../../lib/registries/action-registry.mjs';
import {defineLocalAction} from '../../lib/util/define-local.mjs';
import ActionId from '../action-id.mjs';
import {SingleRecipeAction} from '../lib/single-recipe-action.mjs';

defineLocalAction(
  SingleRecipeAction
    .new<Runecrafting>({
      category: InternalCategory.START_SKILL,
      id: ActionId.StartSkillRunecrafting,
      options: [
        {
          id: 'recipe',
          label: 'Item',
          registry: ['runecrafting', 'actions'],
          required: true,
          type: 'MediaItem',
        },
      ],
      skillKey: 'runecrafting',
    })
    .exec(SingleRecipeAction.artisanExec)
);
