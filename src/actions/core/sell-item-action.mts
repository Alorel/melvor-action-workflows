import type {Item} from 'melvor';
import {InternalCategory} from '../../lib/registries/action-registry.mjs';
import {defineLocalAction} from '../../lib/util/define-local.mjs';

interface Props {
  items: Item[];
}

defineLocalAction<Props>({
  category: InternalCategory.CORE,
  execute({items}) {
    for (const item of items) {
      const qty = game.bank.getQty(item);
      if (qty) {
        game.bank.processItemSale(item, qty);
      }
    }
  },
  initOptions: () => ({items: [undefined as any]}),
  label: 'Sell items',
  localID: 'sellItem',
  media: game.pages.getObjectByID('melvorD:Shop')!.media,
  options: [
    {
      label: 'Items',
      localID: 'items',
      multi: true,
      registry: 'items',
      required: true,
      type: 'MediaItem',
    },
  ],
});
