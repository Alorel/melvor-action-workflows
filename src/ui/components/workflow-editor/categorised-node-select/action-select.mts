import type {ActionNodeDefinitionImpl} from '../../../../lib/registries/action-registry.mjs';
import {ACTION_REGISTRY} from '../../../../lib/registries/action-registry.mjs';
import categoriseRegistryObjects from '../../../../lib/util/categorise-registry-objects.mjs';
import LazyValue from '../../../../lib/util/lazy-value.mjs';
import CategorisedNodeSelect from './categorised-node-select.mjs';

export const allActions = new LazyValue(() => categoriseRegistryObjects(ACTION_REGISTRY));

interface Props {
  deletable?: boolean;

  onDelete?(): void;

  value: ActionNodeDefinitionImpl<any>;

  onChange(value: ActionNodeDefinitionImpl<any>): void;
}

function getRegistry() {
  return ACTION_REGISTRY;
}

export default function ActionSelect(props: Props) {
  return CategorisedNodeSelect<ActionNodeDefinitionImpl<any>>({
    ...props,
    registry: getRegistry,
    values: allActions.value,
  });
}
