import type {Fish, Fishing, FishingArea} from 'melvor';
import {InternalCategory} from '../../lib/registries/action-registry.mjs';
import {defineLocalAction} from '../../lib/util/define-local.mjs';
import LazyValue from '../../lib/util/lazy-value.mjs';
import ActionId from '../action-id.mjs';
import {segmentSkillAreasAndRecipes} from '../lib/segment-skill-areas-and-recipes.mjs';
import {SingleRecipeAction} from '../lib/single-recipe-action.mjs';

const fishAreaMap = new LazyValue(() => segmentSkillAreasAndRecipes<FishingArea, Fish>(game.fishing.areas, 'fish'));

defineLocalAction(
  SingleRecipeAction
    .new<Fishing>({
      category: InternalCategory.START_SKILL,
      id: ActionId.StartSkillFishing,
      options: [
        {
          id: 'recipe',
          label: 'Fish',
          registry: ['fishing', 'actions'],
          required: true,
          type: 'MediaItem',
        },
      ],
      skillKey: 'fishing',
    })
    .prep<FishingArea>(function startFishingPrep({recipe: fish}) {
      const area = fishAreaMap.value.get(fish);
      if (!area) {
        throw new Error(`Can't find fishing area for ${fish.name}`);
      }

      return area;
    })
    .exec(function startFishingExec({recipe: fish}, area) {
      this.skill.onAreaFishSelection(area, fish);
      this.skill.onAreaStartButtonClick(area);
    })
);
