import type {Thieving, ThievingArea, ThievingNPC} from 'melvor';
import {InternalCategory} from '../../lib/registries/action-registry.mjs';
import {defineLocalAction} from '../../lib/util/define-local.mjs';
import LazyValue from '../../lib/util/lazy-value.mjs';
import ActionId from '../action-id.mjs';
import {segmentSkillAreasAndRecipes} from '../lib/segment-skill-areas-and-recipes.mjs';
import {SingleRecipeAction} from '../lib/single-recipe-action.mjs';

const npcAreaMap = new LazyValue(() => (
  segmentSkillAreasAndRecipes<ThievingArea, ThievingNPC>(game.thieving.areas, 'npcs')
));

defineLocalAction(
  SingleRecipeAction
    .new<Thieving>({
      category: InternalCategory.START_SKILL,
      id: ActionId.StartSkillThieving,
      options: [
        {
          id: 'recipe',
          label: 'NPC',
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
