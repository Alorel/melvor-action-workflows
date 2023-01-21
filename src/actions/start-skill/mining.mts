import type {Mining} from 'melvor';
import {InternalCategory} from '../../lib/registries/action-registry.mjs';
import {defineLocalAction} from '../../lib/util/define-local.mjs';
import ActionId from '../action-id.mjs';
import {SingleRecipeAction} from '../lib/single-recipe-action.mjs';

defineLocalAction(
  SingleRecipeAction
    .new<Mining>({
      category: InternalCategory.START_SKILL,
      id: ActionId.StartSkillMining,
      options: [
        {
          id: 'recipe',
          label: 'Rock',
          registry: ['mining', 'actions'],
          required: true,
          type: 'MediaItem',
        },
      ],
      skillKey: 'mining',
    })
    .prep(function startMiningPrep({recipe}) {
      if (!this.skill.canMineOre(recipe)) {
        throw new Error(`Can't mine ${recipe.name}`);
      }
    })
    .exec(function startMiningExec({recipe: rock}) {
      this.skill.onRockClick(rock);
    })
);
