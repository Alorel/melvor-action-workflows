import type {Cooking, CookingRecipe} from 'melvor';
import {defineAction} from '../../lib/api.mjs';
import {InternalCategory} from '../../lib/registries/action-registry.mjs';
import type {SingleRecipeData} from '../_common/single-recipe-action.mjs';
import {SingleRecipeAction} from '../_common/single-recipe-action.mjs';

interface Data extends SingleRecipeData<Cooking> {
  passives: Array<this['recipe']>;
}

defineAction(
  SingleRecipeAction
    .new<Data, Cooking>({
      category: InternalCategory.START_SKILL,
      localID: 'startCooking',
      options: [
        {
          label: 'Active',
          localID: 'recipe',
          registry: ['cooking', 'actions'],
          required: true,
          type: 'MediaItem',
        },
        {
          label: 'Passive',
          localID: 'passives',
          mediaFilter: (passive: CookingRecipe, {recipe: active}: Data) => passive.category.id !== active.category.id,
          multi: {
            maxLength: 2,
          },
          registry: ['cooking', 'actions'],
          type: 'MediaItem',
          uiKey: ({recipe}: Data) => recipe?.id ?? '',
        },
      ],
      skillKey: 'cooking',
    })
    .exec(function startCookingExec({passives, recipe}) {
      const skill = this.skill;

      if (!skill.isActive || !skill.activeCookingCategory || skill.activeRecipe.id !== recipe.id) {
        skill.onRecipeSelectionClick(recipe);
        skill.onActiveCookButtonClick(recipe.category);
      }

      if (passives?.length) {
        for (const p of passives) {
          skill.onRecipeSelectionClick(p);
          skill.passiveCookingAction(p.category);
        }
      }
    })
);

