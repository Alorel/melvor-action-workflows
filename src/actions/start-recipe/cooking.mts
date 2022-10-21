import type {Cooking, CookingRecipe} from 'melvor';
import {defineAction} from '../../lib/api.mjs';
import {InternalActionId, InternalCategory} from '../../lib/registries/action-registry.mjs';
import {warnLog} from '../../lib/util/log.mjs';
import type {SingleRecipeData} from '../common/single-recipe-action.mjs';
import {SingleRecipeAction} from '../common/single-recipe-action.mjs';

interface Data extends SingleRecipeData<Cooking> {
  passive?: this['recipe'];
}

defineAction(
  SingleRecipeAction
    .new<Data, Cooking>({
      category: InternalCategory.CRAFTING,
      label: 'Cook',
      localID: InternalActionId.COOKING,
      options: [
        {
          label: 'Active',
          localID: 'recipe',
          registry: 'cooking.actions',
          required: true,
          type: 'MediaItem',
        },
        {
          label: 'Passive',
          localID: 'passive',
          registry: 'cooking.actions',
          type: 'MediaItem',
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
