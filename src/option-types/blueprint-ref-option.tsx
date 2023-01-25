import type {AgilityBlueprint} from 'melvor';
import type {VNode} from 'preact';
import {Fragment} from 'preact';
import {useCallback, useMemo} from 'preact/hooks';
import {defineOption} from '../lib/define-option.mjs';
import {EMPTY_ARR} from '../lib/util.mjs';
import type {BlueprintRefOption} from '../public_api';
import Btn from '../ui/components/btn';
import {BinSvg} from '../ui/components/svg';
import {useRenderEditTouch} from './_common.mjs';

defineOption<number, BlueprintRefOption>({
  is: (v): v is BlueprintRefOption => v.type === 'BlueprintRef',
  renderEdit({onChange, value, option: {required}}) {
    const onBlur = useRenderEditTouch();
    const blueprints = useMemo(getBlueprints, EMPTY_ARR);

    const clear = useCallback(() => {
      onChange(undefined);
    }, EMPTY_ARR);
    const onInp = useCallback((e: Event) => {
      const val = (e.target as HTMLSelectElement).value;
      onChange(val ? parseInt(val) : undefined);
    }, [onChange]);

    return (
      <div class={'input-group'}>
        {!required && <Btn kind={'danger'} size={'sm'} onClick={clear}><BinSvg/></Btn>}
        <select class={'form-control form-control-sm'} onBlur={onBlur} onChange={onInp} value={value}>
          {blueprints.map(editOptionMapper)}
        </select>
      </div>
    );
  },
  renderView({value}) {
    const name = value !== undefined && game.agility.blueprints.get(value)?.name;

    return name ? <Fragment>{name}</Fragment> : null;
  },
  token: 'BlueprintRef',
});

function editOptionMapper([idx, {name}]: Tuple): VNode {
  return <option key={idx} value={idx}>{name}</option>;
}

function getBlueprints(): Tuple[] {
  const out = [...game.agility.blueprints.entries()];
  out.sort(([a], [b]) => a === b ? 0 : a > b ? 1 : -1);

  return out;
}

type Tuple = [number, AgilityBlueprint];
