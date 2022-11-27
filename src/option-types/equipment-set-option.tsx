import type {VNode} from 'preact';
import {Fragment} from 'preact';
import {useCallback} from 'preact/hooks';
import {defineOption} from '../lib/api.mjs';
import {EMPTY_ARR} from '../lib/util.mjs';
import type {EquipmentSetOption} from '../public_api';
import {useRenderEditTouch} from './_common.mjs';

defineOption<number, EquipmentSetOption>({
  is: (v): v is EquipmentSetOption => (
    v.type === 'EquipmentSet'
  ),
  renderEdit({value = 0, onChange}) {
    const onInp = useCallback((e: Event) => {
      const newVal = parseInt((e.target as HTMLInputElement).value);
      onChange(isNaN(newVal) ? 0 : newVal);
    }, [onChange]);
    const onBlur = useRenderEditTouch();

    return (
      <select class={'form-control form-control-sm'} onBlur={onBlur} onChange={onInp} value={value}>
        {Array(game.combat.player.numEquipSets).fill(undefined)
          .map(RenderOption)}
      </select>
    );
  },
  renderView: ({value}) => (<Fragment>{value == null ? '' : (value + 1).toLocaleString()}</Fragment>),
  token: 'EquipmentSet',
  validate: (value: number | undefined): string[] => (
    value != null && value >= game.combat.player.numEquipSets
      ? [`Out of bounds! Number of equipment sets available: ${game.combat.player.numEquipSets}`]
      : EMPTY_ARR
  ),
});

function RenderOption(_: any, i: number): VNode {
  return <option key={i} value={i}>{i + 1}</option>;
}
