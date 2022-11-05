import type {Mining} from 'melvor';
import {defineAction} from '../../lib/api.mjs';
import {InternalCategory} from '../../lib/registries/action-registry.mjs';
import {SingleRecipeAction} from '../_common/single-recipe-action.mjs';

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
    .checkRecipe(function startMiningCheck(rock) {
      this.skill.canMineOre(rock);
    })
    .exec(function startMiningExec({recipe: rock}) {
      this.skill.onRockClick(rock);
    })
);
