import type {Item, PotionItem as TPotionItem} from 'melvor';
import {InternalCategory} from '../../lib/registries/action-registry.mjs';
import {defineLocalAction} from '../../lib/util/define-local.mjs';

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
  initOptions: () => ({reuse: true}),
  label: 'Use potion',
  localID: 'usePotion',
  media: cdnMedia('assets/media/bank/deadly_toxins_potion.png'),
  options: [
    {
      label: 'Potion',
      localID: 'potion',
      mediaFilter: (item: Item) => item.type === 'Potion',
      registry: 'items',
      required: true,
      type: 'MediaItem',
    },
    {
      description: 'Auto Re-use Potions for this Skill?',
      label: 'Re-use',
      localID: 'reuse',
      type: Boolean,
    },
  ],
});
