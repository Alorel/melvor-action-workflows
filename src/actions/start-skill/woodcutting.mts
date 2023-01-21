import type {Woodcutting as TWoodcutting, WoodcuttingTree} from 'melvor';
import {InternalCategory} from '../../lib/registries/action-registry.mjs';
import {defineLocalAction} from '../../lib/util/define-local.mjs';
import ActionId from '../action-id.mjs';
import {RecipeAction} from '../lib/recipe-action.mjs';

export interface StartWoodcuttingData {
  recipes: WoodcuttingTree[];
}

defineLocalAction(
  RecipeAction
    .base<StartWoodcuttingData, TWoodcutting>({
      category: InternalCategory.START_SKILL,
      id: ActionId.StartSkillWoodcutting,
      initOptions: () => ({recipes: [undefined as any]}),
      options: [
        {
          id: 'recipes',
          label: 'Trees',
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
      for (const tree of recipes) {
        this.skill.selectTree(tree);
      }
    })
);
