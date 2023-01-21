import type {Summoning, SummoningRecipe} from 'melvor';
import {InternalCategory} from '../../lib/registries/action-registry.mjs';
import {defineLocalAction} from '../../lib/util/define-local.mjs';
import ActionId from '../action-id.mjs';
import type {AltRecipeData, SingleRecipeData} from '../lib/single-recipe-action.mjs';
import {SingleRecipeAction} from '../lib/single-recipe-action.mjs';

defineLocalAction(
  SingleRecipeAction
    .new<AltRecipeData<Summoning>, Summoning>({
      category: InternalCategory.START_SKILL,
      id: ActionId.StartSkillSummoning,
      options: [
        {
          id: 'recipe',
          label: 'Creature',
          registry: ['summoning', 'actions'],
          required: true,
          type: 'MediaItem',
        },
        {
          getAltCostItems: (recipe: SummoningRecipe) => recipe.nonShardItemCosts,
          id: 'alt',
          label: 'Recipe',
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
