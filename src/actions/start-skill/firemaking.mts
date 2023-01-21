import type {Firemaking} from 'melvor';
import {InternalCategory} from '../../lib/registries/action-registry.mjs';
import {defineLocalAction} from '../../lib/util/define-local.mjs';
import ActionId from '../action-id.mjs';
import {SingleRecipeAction} from '../lib/single-recipe-action.mjs';

defineLocalAction(
  SingleRecipeAction
    .new<Firemaking>({
      category: InternalCategory.START_SKILL,
      id: ActionId.StartSkillFiremaking,
      options: [
        {
          id: 'recipe',
          label: 'Logs',
          registry: ['firemaking', 'actions'],
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
