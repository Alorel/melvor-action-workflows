import type {Mining} from 'melvor';
import {defineAction} from '../../lib/api.mjs';
import {InternalCategory} from '../../lib/registries/action-registry.mjs';
import {SingleRecipeAction} from '../lib/single-recipe-action.mjs';

defineAction(
  SingleRecipeAction
    .new<Mining>({
      category: InternalCategory.START_SKILL,
      localID: 'startMining',
      options: [
        {
          label: 'Rock',
          localID: 'recipe',
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
