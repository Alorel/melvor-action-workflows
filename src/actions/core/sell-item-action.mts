import type {Item} from 'melvor';
import {InternalCategory} from '../../lib/registries/action-registry.mjs';
import {defineLocalAction} from '../../lib/util/define-local.mjs';
import ActionId from '../action-id.mjs';

interface Props {
  items: Item[];
}

defineLocalAction<Props>({
  category: InternalCategory.CORE,
  description: 'This will sell the whole stack',
  execute({items}) {
    for (const item of items) {
      const qty = game.bank.getQty(item);
      if (qty > 0) {
        game.bank.processItemSale(item, qty);
      }
    }
  },
  id: ActionId.CoreSellItem,
  initOptions: () => ({items: [undefined as any]}),
  label: 'Sell items',
  media: game.pages.getObjectByID('melvorD:Shop')!.media,
  options: [
    {
      id: 'items',
      label: 'Items',
      multi: true,
      registry: 'items',
      required: true,
      type: 'MediaItem',
    },
  ],
});
