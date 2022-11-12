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
    .exec(function startMiningExec({recipe: rock}) {
      if (this.skill.canMineOre(rock) && (!this.skill.isActive || this.skill.selectedRock?.id !== rock.id)) {
        this.skill.onRockClick(rock);
      }
    })
);
