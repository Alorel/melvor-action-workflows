import type {Herblore} from 'melvor';
import {InternalCategory} from '../../lib/registries/action-registry.mjs';
import {defineLocalAction} from '../../lib/util/define-local.mjs';
import ActionId from '../action-id.mjs';
import {SingleRecipeAction} from '../lib/single-recipe-action.mjs';

defineLocalAction(
  SingleRecipeAction
    .new<Herblore>({
      category: InternalCategory.START_SKILL,
      id: ActionId.StartSkillHerblore,
      options: [
        {
          id: 'recipe',
          label: 'Item',
          registry: ['herblore', 'actions'],
          required: true,
          type: 'MediaItem',
        },
      ],
      skillKey: 'herblore',
    })
    .exec(SingleRecipeAction.artisanExec)
);
