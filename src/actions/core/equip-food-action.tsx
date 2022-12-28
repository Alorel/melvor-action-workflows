import type {FoodItem as TFoodItem} from 'melvor';
import {Fragment} from 'preact';
import {InternalCategory} from '../../lib/registries/action-registry.mjs';
import {defineLocalAction} from '../../lib/util/define-local.mjs';
import {BigNum} from '../../ui/components/big-num';
import {RenderNodeMedia} from '../../ui/pages/workflows-dashboard/render-node-media';

interface Data {
  item: TFoodItem;

  qty?: number;
}

defineLocalAction<Data>({
  category: InternalCategory.CORE,
  compactRender: ({item, qty}) => (
    <Fragment>
      <span>{'Equip '}</span>
      {qty != null && (
        <Fragment>
          <BigNum num={qty}/>
          <span>{' '}</span>
        </Fragment>
      )}
      <RenderNodeMedia label={item.name} media={item.media}/>
    </Fragment>
  ),
  execute({item, qty}) {
    const bankQty = game.bank.getQty(item);
    if (!bankQty) {
      return;
    }

    game.combat.player.equipFood(item, Math.min(qty ?? bankQty, bankQty));
  },
  label: 'Equip food',
  localID: 'equipFood',
  media: game.items.getObjectByID('melvorD:Anglerfish')!.media,
  options: [
    {
      label: 'Item',
      localID: 'item',
      mediaFilter: item => item instanceof FoodItem,
      registry: 'items',
      required: true,
      type: 'MediaItem',
    },
    {
      description: 'Leave empty to equip all',
      label: 'Quantity',
      localID: 'qty',
      min: 1,
      type: Number,
    },
  ],
});
