import type {TriggerDefinitionContext} from '../../../../lib/data/trigger-definition-context.mjs';
import {TRIGGER_REGISTRY} from '../../../../lib/registries/trigger-registry.mjs';
import categoriseRegistryObjects from '../../../../lib/util/categorise-registry-objects.mjs';
import {lazyValue} from '../../../../lib/util/lazy-value.mjs';
import CategorisedNodeSelect from './categorised-node-select.mjs';

interface Props {
  value: TriggerDefinitionContext | undefined;

  onChange(value?: TriggerDefinitionContext): void;
}

function getRegistry(): typeof TRIGGER_REGISTRY {
  return TRIGGER_REGISTRY;
}

export default function TriggerSelect(props: Props) {
  return CategorisedNodeSelect<TriggerDefinitionContext>({
    ...props,
    registry: getRegistry,
    values: allTriggerSelectGroups.value,
  });
}

export const allTriggerSelectGroups = lazyValue(() => categoriseRegistryObjects(TRIGGER_REGISTRY));
