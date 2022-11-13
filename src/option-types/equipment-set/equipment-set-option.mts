import {range} from 'lodash-es';
import {defineOption} from '../../lib/api.mjs';
import {EMPTY_ARR} from '../../lib/util.mjs';
import type {EquipmentSetOption} from '../../public_api';
import {makeComponent} from '../../ui/common.mjs';
import {RenderValueDirect} from '../../ui/pages/dashboard/render-node-option-value/render-node-option-value.mjs';
import id from './render-equipment-set-option.pug';

defineOption<number, EquipmentSetOption>({
  is: (v): v is EquipmentSetOption => (
    v.type === 'EquipmentSet'
  ),
  renderEdit({option, initialValue, onChange, validation}) {
    let val = initialValue ?? 0;

    return makeComponent(`#${id}`, {
      onChange,
      optRange: range(game.combat.player.numEquipSets),
      required: Boolean(option.required),
      validation,
      get value(): number {
        return val;
      },
      set value(newVal: string | number | undefined) {
        switch (typeof newVal) {
          case 'number':
            val = newVal;
            break;
          case 'string': {
            const asNum = parseInt(newVal);
            val = isNaN(asNum) ? 0 : asNum;
            break;
          }
          default:
            val = 0;
        }

        this.onChange(val);
      },
    });
  },
  renderView: ({value}) => RenderValueDirect(value == null ? '' : (value + 1).toLocaleString()),
  token: 'EquipmentSet',
  validate: (value: number | undefined): string[] => (
    value != null && value >= game.combat.player.numEquipSets
      ? [`Out of bounds! Max value: ${game.combat.player.numEquipSets}`]
      : EMPTY_ARR
  ),
});
