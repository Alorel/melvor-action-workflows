import type {ShopPurchase} from 'melvor';
import {InternalCategory} from '../../lib/registries/action-registry.mjs';
import {defineLocalAction} from '../../lib/util/define-local.mjs';

interface Props {
  item: ShopPurchase;
  qty?: number;
}

defineLocalAction<Props>({
  category: InternalCategory.CORE,
  execute({item, qty}) {
    game.shop.buyQuantity = item.allowQuantityPurchase ? (qty ?? 1) : 1;
    game.shop.buyItemOnClick(item, true);
  },
  label: 'Buy item',
  localID: 'BuyItem',
  media: cdnMedia('assets/media/main/coins.svg'),
  options: [
    {
      label: 'Item',
      localID: 'item',
      mediaFilter: (item: ShopPurchase) => item.getBuyLimit(game.currentGamemode) > game.shop.getPurchaseCount(item),
      registry: 'shop.purchases',
      required: true,
      type: 'MediaItem',
    },
    {
      label: 'Quantity',
      localID: 'qty',
      min: 1,
      showIf: ({item}: Partial<Props>) => item?.allowQuantityPurchase === true,
      type: Number,
    },
  ],
});
