import type {Summoning, SummoningRecipe} from 'melvor';
import {defineAction} from '../../lib/api.mjs';
import {InternalCategory} from '../../lib/registries/action-registry.mjs';
import type {AltRecipeData, SingleRecipeData} from '../lib/single-recipe-action.mjs';
import {SingleRecipeAction} from '../lib/single-recipe-action.mjs';

defineAction(
  SingleRecipeAction
    .new<AltRecipeData<Summoning>, Summoning>({
      category: InternalCategory.START_SKILL,
      localID: 'startSummmon',
      options: [
        {
          label: 'Creature',
          localID: 'recipe',
          registry: ['summoning', 'actions'],
          required: true,
          type: 'MediaItem',
        },
        {
          getAltCostItems: (recipe: SummoningRecipe) => recipe.nonShardItemCosts,
          label: 'Recipe',
          localID: 'alt',
          recipeOption: 'recipe',
          required: true,
          showIf: ({recipe}: SingleRecipeData<Summoning>) => Boolean(recipe?.nonShardItemCosts.length),
          type: 'AltRecipeCost',
        },
      ],
      skillKey: 'summoning',
    })
    .exec(SingleRecipeAction.altArtisanExec)
);
