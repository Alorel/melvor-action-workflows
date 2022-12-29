import type {EquipmentItem as TEquipmentItem} from 'melvor';
import {Fragment} from 'preact';
import {InternalCategory} from '../../lib/registries/action-registry.mjs';
import {defineLocalTrigger} from '../../lib/util/define-local.mjs';
import {BigNum} from '../../ui/components/big-num';
import {RenderNodeMedia} from '../../ui/pages/workflows-dashboard/render-node-media';

interface Data {
  charges: number;

  item: TEquipmentItem;
}

function check({charges, item}: Data): boolean {
  return (game.itemCharges.charges.get(item) ?? 0) <= charges;
}

const triggerCtx = defineLocalTrigger<Data>({
  category: InternalCategory.CORE,
  check,
  compactRender: ({charges, item}) => (
    <Fragment>
      <span>{'≤ '}</span>
      <BigNum num={charges}/>
      <span>{' charges on '}</span>
      <RenderNodeMedia label={item.name} media={item.media}/>
    </Fragment>
  ),
  init() {
    ctx.patch(Player, 'consumeEquipmentCharges').after(() => {
      triggerCtx.notifyListeners(check);
    });
  },
  label: 'Item charges left',
  localID: 'itemCharges',
  media: game.items.getObjectByID('melvorD:Gem_Gloves')!.media,
  options: [
    {
      label: 'Item',
      localID: 'item',
      mediaFilter: item => item instanceof EquipmentItem,
      registry: 'items',
      required: true,
      type: 'MediaItem',
    },
    {
      label: 'Charges',
      localID: 'charges',
      min: 0,
      required: true,
      type: Number,
    },
  ],
});
