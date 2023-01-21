import type {Item, PotionItem as TPotionItem} from 'melvor';
import {InternalCategory} from '../../lib/registries/action-registry.mjs';
import {defineLocalAction} from '../../lib/util/define-local.mjs';
import ActionId from '../action-id.mjs';

interface Props {
  potion: TPotionItem;

  reuse?: boolean;
}

defineLocalAction<Props>({
  category: InternalCategory.CORE,
  execute({potion, reuse}) {
    const mgr = game.potions;

    if (!game.bank.getQty(potion)) {
      return;
    }

    const shouldReuse = reuse !== false;
    if (shouldReuse !== mgr.autoReusePotionsForAction(potion.action)) {
      mgr.toggleAutoReusePotion(potion.action);
    }

    if (!mgr.isPotionActive(potion)) {
      mgr.usePotion(potion);
    }
  },
  id: ActionId.CoreUsePotion,
  initOptions: () => ({reuse: true}),
  label: 'Use potion',
  media: cdnMedia('assets/media/bank/deadly_toxins_potion.png'),
  options: [
    {
      id: 'potion',
      label: 'Potion',
      mediaFilter: (item: Item) => item.type === 'Potion',
      registry: 'items',
      required: true,
      type: 'MediaItem',
    },
    {
      description: 'Auto Re-use Potions for this Skill?',
      id: 'reuse',
      label: 'Re-use',
      type: Boolean,
    },
  ],
});
