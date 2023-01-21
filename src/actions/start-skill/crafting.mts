import type {Crafting} from 'melvor';
import {InternalCategory} from '../../lib/registries/action-registry.mjs';
import {defineLocalAction} from '../../lib/util/define-local.mjs';
import ActionId from '../action-id.mjs';
import {SingleRecipeAction} from '../lib/single-recipe-action.mjs';

defineLocalAction(
  SingleRecipeAction
    .new<Crafting>({
      category: InternalCategory.START_SKILL,
      id: ActionId.StartSkillCrafting,
      options: [
        {
          id: 'recipe',
          label: 'Item',
          registry: ['crafting', 'actions'],
          required: true,
          type: 'MediaItem',
        },
      ],
      skillKey: 'crafting',
    })
    .exec(SingleRecipeAction.artisanExec)
);
