import type {Fish, Fishing, FishingArea} from 'melvor';
import {defineAction} from '../../lib/api.mjs';
import {InternalCategory} from '../../lib/registries/action-registry.mjs';
import LazyValue from '../../lib/util/lazy-value.mjs';
import {segmentSkillAreasAndRecipes} from '../_common/segment-skill-areas-and-recipes.mjs';
import {SingleRecipeAction} from '../_common/single-recipe-action.mjs';

const fishAreaMap = new LazyValue(() => segmentSkillAreasAndRecipes<FishingArea, Fish>(game.fishing.areas, 'fish'));

defineAction(
  SingleRecipeAction
    .new<Fishing>({
      category: InternalCategory.START_SKILL,
      localID: 'startFishing',
      options: [
        {
          label: 'Fish',
          localID: 'recipe',
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
      if (!this.skill.isActive || isDifferent(area, fish)) {
        this.skill.onAreaFishSelection(area, fish);
        this.skill.onAreaStartButtonClick(area);
      }
    })
);

function isDifferent(area: FishingArea, fish: Fish): boolean {
  const activeArea = game.fishing.activeFishingArea;

  return activeArea?.id !== area.id || game.fishing.activeFish.id !== fish.id;
}
