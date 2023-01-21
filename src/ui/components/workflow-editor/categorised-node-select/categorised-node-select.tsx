import type {ComponentChildren, VNode} from 'preact';
import {useCallback} from 'preact/compat';
import type {NamespacedDefinition} from '../../../../lib/namespaced-definition.mjs';
import type {StdRegistryKey} from '../../../../lib/registries/registries.mjs';
import type {CategorisedObject} from '../../../../lib/util/categorise-registry-objects.mjs';
import {errorLog} from '../../../../lib/util/log.mjs';
import type {Referenceable} from '../../../../public_api';
import Btn from '../../btn';
import {BinSvg} from '../../svg';

type Def = NamespacedDefinition<Referenceable>;

interface Props<T> {
  children?: ComponentChildren;

  clearable?: boolean;

  registry: Map<StdRegistryKey, T>;

  value: T | undefined;

  values: Array<CategorisedObject<T>>;

  onChange(value?: T): void;
}

export {Props as CategorisedNodeSelectProps};

/** Common select for actions & triggers */
export default function CategorisedNodeSelect<T extends Def>({
  children,
  clearable = false,
  onChange,
  registry,
  value,
  values,
}: Props<T>): VNode {

  const selectedId = value?.id;
  const clear = useClear(value, onChange);
  const onSelectChange = useOnSelectChange(selectedId, onChange, registry, values);

  return (
    <div class={'input-group'}>
      {children}
      {clearable && <Btn size={'sm'} kind={'default'} onClick={clear}><BinSvg/></Btn>}
      <select class={'form-control form-control-sm'} value={selectedId} onChange={onSelectChange}>
        {values.map(optGroupMapper)}
      </select>
    </div>
  );
}

function useClear<T>(value: T, onChange: () => void): () => void {
  const isClearable = value != null;

  return useCallback(() => {
    if (isClearable) {
      onChange();
    }
  }, [isClearable, onChange]);
}

function useOnSelectChange<T extends Def>(
  selectedId: string | undefined,
  onChange: (value?: T) => void,
  registry: Map<StdRegistryKey, T>,
  values: Array<CategorisedObject<T>>
): (e: Event) => void {
  const firstItem = values[0].items[0];

  return useCallback((e: Event) => {
    const newId = (e.target as HTMLSelectElement).value;

    if (newId) {
      let out = registry.get(newId);

      // Account for numeric IDs coming from within this mod
      if (!out) {
        const asNum = parseInt(newId);
        if (!isNaN(asNum)) {
          out = registry.get(asNum);
        }
      }

      if (out) {
        onChange(out);
        return;
      }

      errorLog('Somehow got', newId, 'in <select>, but not in the registry');
    }

    if (selectedId !== firstItem.id) {
      onChange(firstItem);
    }
  }, [selectedId, firstItem, registry]);
}

function optGroupMapper<T extends Def>(group: CategorisedObject<T>): VNode {
  return (
    <optgroup label={group.category} key={group.category}>
      {group.items.map(optGroupItemMapper)}
    </optgroup>
  );
}

function optGroupItemMapper<T extends Def>(item: T): VNode {
  return <option key={item.id} value={item.id}>{item.def.label}</option>;
}
