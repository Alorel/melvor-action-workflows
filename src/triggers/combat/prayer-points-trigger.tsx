import {Fragment} from 'preact';
import {InternalCategory} from '../../lib/registries/action-registry.mjs';
import {defineLocalTrigger} from '../../lib/util/define-local.mjs';
import {NUM_COMPARE_ENUM, NumComparator, numCompare} from '../../lib/util/num-compare.mjs';
import {BigNum} from '../../ui/components/big-num';
import TriggerId from '../trigger-id.mjs';

interface Data {
  amount: number;

  comparator: NumComparator;
}

function check({comparator, amount}: Data): boolean {
  return numCompare(game.combat.player.prayerPoints, comparator, amount);
}

const triggerCtx = defineLocalTrigger<Data>({
  category: InternalCategory.COMBAT,
  check,
  compactRender: ({amount, comparator}) => (
    <Fragment>
      <span>{`Prayer Points ${NUM_COMPARE_ENUM[comparator]} `}</span>
      <BigNum num={amount}/>
    </Fragment>
  ),
  id: TriggerId.CombatPrayerPoints,
  init() {
    function notify() {
      triggerCtx.notifyListeners(check);
    }

    ctx.patch(Player, 'consumePrayerPoints').after(notify);
    ctx.patch(Player, 'addPrayerPoints').after(notify);
  },
  initOptions: () => ({comparator: NumComparator.LTE}),
  label: 'Prayer Points',
  media: game.prayer.media,
  options: [
    {
      enum: NUM_COMPARE_ENUM,
      id: 'comparator',
      label: 'Comparator',
      required: true,
      type: String,
    },
    {
      id: 'amount',
      label: 'Amount',
      min: 0,
      required: true,
      type: Number,
    },
  ],
});
