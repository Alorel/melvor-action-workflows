import type {Fletching, FletchingAlternativeCosts, FletchingRecipe, Item} from 'melvor';
import {InternalCategory} from '../../lib/registries/action-registry.mjs';
import {defineLocalAction} from '../../lib/util/define-local.mjs';
import ActionId from '../action-id.mjs';
import type {AltRecipeData, SingleRecipeData} from '../lib/single-recipe-action.mjs';
import {SingleRecipeAction} from '../lib/single-recipe-action.mjs';

function mapAltCost(altCost: FletchingAlternativeCosts): Item {
  return altCost.itemCosts[0].item;
}

defineLocalAction(
  SingleRecipeAction
    .new<AltRecipeData<Fletching>, Fletching>({
      category: InternalCategory.START_SKILL,
      id: ActionId.StartSkillFletching,
      options: [
        {
          id: 'recipe',
          label: 'Item',
          registry: ['fletching', 'actions'],
          required: true,
          type: 'MediaItem',
        },
        {
          getAltCostItems: (recipe: FletchingRecipe) => recipe.alternativeCosts?.map(mapAltCost) ?? [],
          id: 'alt',
          label: 'Logs',
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
