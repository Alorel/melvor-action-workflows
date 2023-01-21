import type {Cooking, CookingRecipe} from 'melvor';
import {InternalCategory} from '../../lib/registries/action-registry.mjs';
import {defineLocalAction} from '../../lib/util/define-local.mjs';
import ActionId from '../action-id.mjs';
import type {SingleRecipeData} from '../lib/single-recipe-action.mjs';
import {SingleRecipeAction} from '../lib/single-recipe-action.mjs';

interface Data extends SingleRecipeData<Cooking> {
  passives: Array<this['recipe']>;
}

defineLocalAction(
  SingleRecipeAction
    .new<Data, Cooking>({
      category: InternalCategory.START_SKILL,
      id: ActionId.StartSkillCooking,
      options: [
        {
          id: 'recipe',
          label: 'Active',
          registry: ['cooking', 'actions'],
          required: true,
          type: 'MediaItem',
        },
        {
          id: 'passives',
          label: 'Passive',
          mediaFilter: (passive: CookingRecipe, {recipe: active}: Data) => passive.category.id !== active.category.id,
          multi: {
            maxLength: 2,
          },
          registry: ['cooking', 'actions'],
          type: 'MediaItem',
        },
      ],
      skillKey: 'cooking',
    })
    .exec(function startCookingExec({passives, recipe}) {
      const skill = this.skill;

      skill.onRecipeSelectionClick(recipe);
      skill.onActiveCookButtonClick(recipe.category);

      if (passives?.length) {
        for (const p of passives) {
          skill.onRecipeSelectionClick(p);
          skill.passiveCookingAction(p.category);
        }
      }
    })
);

