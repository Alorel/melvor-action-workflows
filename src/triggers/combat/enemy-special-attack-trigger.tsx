import type {SpecialAttack as TSpecialAttack} from 'melvor';
import {Fragment} from 'preact';
import {InternalCategory} from '../../lib/registries/action-registry.mjs';
import {defineLocalTrigger} from '../../lib/util/define-local.mjs';
import {EqNeq, getEqNeqFn} from '../../lib/util/eqneq.mjs';

interface Data {
  atk: TSpecialAttack;

  match: EqNeq;
}

const triggerCtx = defineLocalTrigger<Data>({
  category: InternalCategory.COMBAT,
  check: d => game.combat.isActive && getEqNeqFn(d.match)(game.combat.enemy.nextAttack.id, d.atk.id),
  init() {
    ctx.patch(Enemy, 'queueNextAction').after(() => {
      const atk = game.combat.enemy.nextAttack.id;
      triggerCtx.notifyListeners(d => getEqNeqFn(d.match)(atk, d.atk.id));
    });
  },
  initOptions: () => ({match: EqNeq.EQ}),
  label: 'Monster attack',
  localID: 'enemyAtk',
  media: cdnMedia('assets/media/bank/Mask_of_Torment.png'),
  options: [
    {
      icon: false,
      itemRender: ({item}: {item: TSpecialAttack}) => (
        <Fragment>
          <span class={'font-w600'}>{`${item.name} `}</span>
          <small>{item.description}</small>
        </Fragment>
      ),
      label: 'Attack',
      localID: 'atk',
      registry: 'specialAttacks',
      required: true,
      type: 'MediaItem',
    },
    {
      enum: {
        [EqNeq.EQ]: 'Casting attack',
        [EqNeq.NEQ]: 'Not casting attack',
      },
      label: 'Match',
      localID: 'match',
      required: true,
      type: String,
    },
  ],
});
