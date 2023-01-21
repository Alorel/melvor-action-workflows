import type {Class, Currency, Game} from 'melvor';
import type {TypedKeys} from 'mod-util/typed-keys';
import {Fragment} from 'preact';
import {InternalCategory} from '../../lib/registries/action-registry.mjs';
import {defineLocalTrigger} from '../../lib/util/define-local.mjs';
import {NUM_COMPARE_ENUM, NumComparator, numCompare} from '../../lib/util/num-compare.mjs';
import type {TriggerNodeDefinition} from '../../public_api';
import {BigNum} from '../../ui/components/big-num';
import TriggerId from '../trigger-id.mjs';

interface Data {
  amount: number;

  comparator: NumComparator;
}

const base = {
  category: InternalCategory.CURRENCY,
  initOptions: () => ({comparator: NumComparator.GTE}),
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
} satisfies Partial<TriggerNodeDefinition<Data>>;

const makeTrigger = (
  key: TypedKeys<Game, Currency>,
  clazz: Class<Currency>,
  id: TriggerId,
  icon: string,
  label: string
): void => {
  const check = ({comparator, amount}: Data): boolean => numCompare(game[key].amount, comparator, amount);

  const triggerCtx = defineLocalTrigger<Data>({
    ...base,
    check,
    compactRender: ({amount, comparator}) => (
      <Fragment>
        <span>{`${label} ${NUM_COMPARE_ENUM[comparator]} `}</span>
        <BigNum num={amount}/>
      </Fragment>
    ),
    id,
    init() {
      ctx.patch(clazz, 'onAmountChange').after(() => {
        triggerCtx.notifyListeners(check);
      });
    },
    label,
    media: cdnMedia(`assets/media/main/${icon}.svg`),
  });
};

makeTrigger('gp', GP, TriggerId.CurrencyGold, 'coins', 'GP');
makeTrigger('slayerCoins', SlayerCoins, TriggerId.CurrencySlayer, 'slayer_coins', 'Slayer Coins');
