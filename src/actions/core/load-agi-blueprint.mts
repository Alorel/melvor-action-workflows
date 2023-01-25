import {InternalCategory} from '../../lib/registries/action-registry.mjs';
import {githubAsset} from '../../lib/util.mjs';
import {defineLocalAction} from '../../lib/util/define-local.mjs';
import ActionId from '../action-id.mjs';

interface Props {
  idx: number;
}

defineLocalAction<Props>({
  category: InternalCategory.CORE,
  description: 'Loads an agility blueprint. Make sure you have enough resources & currency!',
  execute({idx}) {
    const agi = game.agility;
    const blueprint = agi.blueprints.get(idx);
    if (blueprint === undefined) {
      throw new Error('Blueprint not found');
    }

    game.agility.replaceCourseWithBlueprint(blueprint);
  },
  id: ActionId.CoreLoadAgilityBlueprint,
  initOptions: () => ({idx: 0}),
  label: 'Load Agility Blueprint',
  media: githubAsset('src/ui/assets/blueprint.png', '0.14.0'),
  options: [
    {
      id: 'idx',
      label: 'Blueprint',
      required: true,
      type: 'BlueprintRef',
    },
  ],
});
