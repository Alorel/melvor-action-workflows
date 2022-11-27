import type {Fletching, FletchingAlternativeCosts, FletchingRecipe, Item} from 'melvor';
import {defineAction} from '../../lib/api.mjs';
import {InternalCategory} from '../../lib/registries/action-registry.mjs';
import type {AltRecipeData, SingleRecipeData} from '../lib/single-recipe-action.mjs';
import {SingleRecipeAction} from '../lib/single-recipe-action.mjs';

function mapAltCost(altCost: FletchingAlternativeCosts): Item {
  return altCost.itemCosts[0].item;
}

defineAction(
  SingleRecipeAction
    .new<AltRecipeData<Fletching>, Fletching>({
      category: InternalCategory.START_SKILL,
      localID: 'startFletching',
      options: [
        {
          label: 'Item',
          localID: 'recipe',
          registry: ['fletching', 'actions'],
          required: true,
          type: 'MediaItem',
        },
        {
          getAltCostItems: (recipe: FletchingRecipe) => recipe.alternativeCosts?.map(mapAltCost) ?? [],
          label: 'Logs',
          localID: 'alt',
          recipeOption: 'recipe',
          required: true,
          showIf: ({recipe}: SingleRecipeData<Fletching>) => Boolean(recipe?.alternativeCosts?.length),
          type: 'AltRecipeCost',
        },
      ],
      skillKey: 'fletching',
    })
    .exec(SingleRecipeAction.altArtisanExec)
);
