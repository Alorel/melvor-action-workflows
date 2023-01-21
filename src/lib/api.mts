import type {
  ActionNodeDefinition,
  TriggerDefinitionContext as ITriggerDefinitionContext,
  TriggerNodeDefinition
} from '../public_api';
import {TriggerDefinitionContext} from './data/trigger-definition-context.mjs';
import {checkLocallyDefinedId, isActionNodeDefinition, isTriggerNodeDefinition} from './public-api-validation.mjs';
import {ACTION_REGISTRY, ActionNodeDefinitionImpl} from './registries/action-registry.mjs';
import {TRIGGER_REGISTRY} from './registries/trigger-registry.mjs';

export function defineAction<T extends object = {}>(definition: ActionNodeDefinition<T>): void {
  if (!isActionNodeDefinition(definition)) {
    throw new Error('Invalid action node definition');
  }
  checkLocallyDefinedId(definition);

  ACTION_REGISTRY.set(definition.id, new ActionNodeDefinitionImpl(definition));
}

export function defineTrigger<T extends object = {}>(
  definition: TriggerNodeDefinition<T>
): ITriggerDefinitionContext<T> {
  if (!isTriggerNodeDefinition(definition)) {
    throw new Error('Invalid trigger node definition');
  }
  checkLocallyDefinedId(definition);

  const inst = new TriggerDefinitionContext<T>(definition);
  TRIGGER_REGISTRY.set(definition.id, inst);

  return inst;
}
