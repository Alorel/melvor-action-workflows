import type {Class, Currency, Game} from 'melvor';
import type {TypedKeys} from 'mod-util/typed-keys';
import {Fragment} from 'preact';
import {InternalCategory} from '../../lib/registries/action-registry.mjs';
import {humaniseNum} from '../../lib/util.mjs';
import {defineLocalTrigger} from '../../lib/util/define-local.mjs';
import {NUM_COMPARE_ENUM, NumComparator, numCompare} from '../../lib/util/num-compare.mjs';
import type {TriggerNodeDefinition} from '../../public_api';

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
      label: 'Comparator',
      localID: 'comparator',
      required: true,
      type: String,
    },
    {
      label: 'Amount',
      localID: 'amount',
      min: 0,
      required: true,
      type: Number,
    },
  ],
} satisfies Partial<TriggerNodeDefinition<Data>>;

const makeTrigger = (
  key: TypedKeys<Game, Currency>,
  clazz: Class<Currency>,
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
        <abbr
          class={'text-primary ActionWorkflowsCore-undecorate ActionWorkflowsCore-underdot'}
          title={amount.toLocaleString()}>{humaniseNum(amount)}</abbr>
      </Fragment>
    ),
    init() {
      ctx.patch(clazz, 'onAmountChange').after(() => {
        triggerCtx.notifyListeners(check);
      });
    },
    label,
    localID: key,
    media: cdnMedia(`assets/media/main/${icon}.svg`),
  });
};

makeTrigger('gp', GP, 'coins', 'GP');
makeTrigger('slayerCoins', SlayerCoins, 'slayer_coins', 'Slayer Coins');
