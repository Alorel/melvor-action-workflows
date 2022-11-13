import type {Thieving, ThievingArea, ThievingNPC} from 'melvor';
import {defineAction} from '../../lib/api.mjs';
import {InternalCategory} from '../../lib/registries/action-registry.mjs';
import LazyValue from '../../lib/util/lazy-value.mjs';
import {segmentSkillAreasAndRecipes} from '../_common/segment-skill-areas-and-recipes.mjs';
import {SingleRecipeAction} from '../_common/single-recipe-action.mjs';

const npcAreaMap = new LazyValue(() => (
  segmentSkillAreasAndRecipes<ThievingArea, ThievingNPC>(game.thieving.areas, 'npcs')
));

defineAction(
  SingleRecipeAction
    .new<Thieving>({
      category: InternalCategory.START_SKILL,
      localID: 'startThieving',
      options: [
        {
          label: 'NPC',
          localID: 'recipe',
          registry: ['thieving', 'actions'],
          required: true,
          type: 'MediaItem',
        },
      ],
      skillKey: 'thieving',
    })
    .prep<ThievingArea>(function startThievingPrep({recipe: npc}) {
      const area = npcAreaMap.value.get(npc);
      if (!area) {
        throw new Error(`Can't find thieving area for ${npc.name}`);
      }

      return area;
    })
    .exec(function startThievingExec({recipe: npc}, area) {
      this.skill.startThieving(area, npc);
    })
);
