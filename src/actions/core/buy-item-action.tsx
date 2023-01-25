import type {ShopPurchase} from 'melvor';
import {Fragment} from 'preact';
import {InternalCategory} from '../../lib/registries/action-registry.mjs';
import {defineLocalAction} from '../../lib/util/define-local.mjs';
import {RenderNodeMedia} from '../../ui/pages/workflows-dashboard/render-node-media';
import ActionId from '../action-id.mjs';

interface Props {
  item: ShopPurchase;

  qty?: number;
}

defineLocalAction<Props>({
  category: InternalCategory.CORE,
  compactRender: ({item, qty}) => (
    <Fragment>
      <span>{'Buy '}</span>
      {item.allowQuantityPurchase && <strong class={'text-primary'}>{`${qty ?? 1}x `}</strong>}
      <RenderNodeMedia label={item.name} media={item.media}/>
    </Fragment>
  ),
  description: 'Buy an item from the shop',
  execute({item, qty}) {
    if (!passesLimitCount(item)) {
      return;
    }
    game.shop.buyQuantity = item.allowQuantityPurchase ? (qty ?? 1) : 1;
    game.shop.buyItemOnClick(item, true);
  },
  id: ActionId.CoreBuyItem,
  label: 'Buy item',
  media: cdnMedia('assets/media/main/coins.svg'),
  options: [
    {
      id: 'item',
      label: 'Item',
      mediaFilter: passesLimitCount,
      registry: 'shop.purchases',
      required: true,
      type: 'MediaItem',
      validateIgnoreMediaFilter: true,
    },
    {
      id: 'qty',
      label: 'Quantity',
      min: 1,
      placeholder: '1',
      showIf: ({item}: Partial<Props>) => item?.allowQuantityPurchase === true,
      type: Number,
    },
  ],
});

function passesLimitCount(item: ShopPurchase): boolean {
  return item.getBuyLimit(game.currentGamemode) > game.shop.getPurchaseCount(item);
}
