import type {Fish, Fishing, FishingArea} from 'melvor';
import {defineAction} from '../../lib/api.mjs';
import {InternalActionId, InternalCategory} from '../../lib/registries/action-registry.mjs';
import {lazyValue} from '../../lib/util/lazy-value.mjs';
import {SingleRecipeAction} from '../common/single-recipe-action.mjs';

const fishAreaMap = lazyValue(function fishAreaMapFactory(): WeakMap<Fish, FishingArea> {
  const out = new WeakMap<Fish, FishingArea>();

  for (const area of game.fishing.areas.registeredObjects.values()) {
    for (const fish of area.fish) {
      out.set(fish, area);
    }
  }

  return out;
});

defineAction(
  SingleRecipeAction
    .new<Fishing>({
      category: InternalCategory.GATHERING,
      label: 'Fish',
      localID: InternalActionId.FISHING,
      options: [
        {
          label: 'Fish',
          localID: 'recipe',
          registry: 'fishing.actions',
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
