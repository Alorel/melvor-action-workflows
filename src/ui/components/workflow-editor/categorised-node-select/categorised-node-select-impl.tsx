import type {VNode} from 'preact';
import type {TriggerDefinitionContext} from '../../../../lib/data/trigger-definition-context.mjs';
import type {ActionNodeDefinitionImpl} from '../../../../lib/registries/action-registry.mjs';
import {ACTION_REGISTRY} from '../../../../lib/registries/action-registry.mjs';
import {TRIGGER_REGISTRY} from '../../../../lib/registries/trigger-registry.mjs';
import categoriseRegistryObjects from '../../../../lib/util/categorise-registry-objects.mjs';
import LazyValue from '../../../../lib/util/lazy-value.mjs';
import type {CategorisedNodeSelectProps} from './categorised-node-select';
import CategorisedNodeSelect from './categorised-node-select';

type Props<T> = Omit<CategorisedNodeSelectProps<T>, 'registry' | 'values'>;
export const allActions = new LazyValue(() => categoriseRegistryObjects(ACTION_REGISTRY));
export const allTriggerSelectGroups = new LazyValue(() => categoriseRegistryObjects(TRIGGER_REGISTRY));

export function ActionSelect(props: Props<ActionNodeDefinitionImpl<any>>): VNode {
  return <CategorisedNodeSelect registry={ACTION_REGISTRY} values={allActions.value} {...props}/>;
}

export function TriggerSelect(props: Props<TriggerDefinitionContext>): VNode {
  return <CategorisedNodeSelect registry={TRIGGER_REGISTRY} values={allTriggerSelectGroups.value} {...props}/>;
}
