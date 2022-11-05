import type {Woodcutting as TWoodcutting, WoodcuttingTree} from 'melvor';
import {defineAction} from '../../lib/api.mjs';
import {InternalCategory} from '../../lib/registries/action-registry.mjs';
import {RecipeAction} from '../_common/recipe-action.mjs';

export interface StartWoodcuttingData {
  recipes: WoodcuttingTree[];
}

defineAction(
  RecipeAction
    .base<StartWoodcuttingData, TWoodcutting>({
      category: InternalCategory.START_SKILL,
      initOptions: () => ({recipes: [undefined as any]}),
      localID: 'startWoodcutting',
      options: [
        {
          label: 'Trees',
          localID: 'recipes',
          multi: {
            maxLength: 2,
          },
          registry: ['woodcutting', 'actions'],
          required: true,
          type: 'MediaItem',
        },
      ],
      skillKey: 'woodcutting',
    })
    .prep(function startWoodcuttingPrep({recipes}) {
      recipes.forEach(this.checkRecipe, this);
    })
    .exec(function startWoodcuttingExec({recipes}) {
      this.skill.stop();
      for (const tree of recipes) {
        this.skill.selectTree(tree);
      }
    })
);
