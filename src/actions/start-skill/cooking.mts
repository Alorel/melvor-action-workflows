import type {Cooking, CookingRecipe} from 'melvor';
import {defineAction} from '../../lib/api.mjs';
import {InternalCategory} from '../../lib/registries/action-registry.mjs';
import {warnLog} from '../../lib/util/log.mjs';
import type {SingleRecipeData} from '../_common/single-recipe-action.mjs';
import {SingleRecipeAction} from '../_common/single-recipe-action.mjs';

interface Data extends SingleRecipeData<Cooking> {
  passive?: this['recipe'];
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
          localID: 'passive',
          mediaFilter: (passive: CookingRecipe, {recipe: active}: Data) => passive.category.id !== active.category.id,
          registry: ['cooking', 'actions'],
          type: 'MediaItem',
          uiKey: ({recipe}: Data) => recipe?.id ?? '',
        },
      ],
      skillKey: 'cooking',
    })
    .prep(function startCookingPrep(opts): Data {
      if (opts.passive) {
        if (opts.passive === opts.recipe) {
          warnLog('Passive cook recipe is same as active cook:', opts.passive);

          const out = {...opts};
          out.passive = undefined;

          return out;
        }

        this.checkRecipe(opts.passive);
      }

      return opts;
    })
    .exec(function startCookingExec(_, {passive, recipe}) {
      clickRecipe(this.skill, recipe, 'Active');
      if (passive) {
        clickRecipe(this.skill, passive, 'Passive');
      }
    })
);

function clickRecipe(ctx: Cooking, recipe: CookingRecipe, type: 'Active' | 'Passive'): void {
  ctx.onRecipeSelectionClick(recipe);
  ctx[`on${type}CookButtonClick`](recipe.category);
}
