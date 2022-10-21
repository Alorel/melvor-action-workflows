import type {
  ActionNodeDefinition,
  TriggerDefinitionContext as ITriggerDefinitionContext,
  TriggerNodeDefinition
} from '../public_api';
import {TriggerDefinitionContext} from './data/trigger-definition-context.mjs';
import {isActionNodeDefinition, isTriggerNodeDefinition} from './public-api-validation.mjs';
import {ACTION_REGISTRY, ActionNodeDefinitionImpl} from './registries/action-registry.mjs';
import {TRIGGER_REGISTRY} from './registries/trigger-registry.mjs';
import {debugLog} from './util/log.mjs';

export function defineAction<T extends object = {}>(definition: ActionNodeDefinition<T>): void {
  if (!isActionNodeDefinition(definition)) {
    throw new Error('Invalid action node definition');
  }

  const inst = new ActionNodeDefinitionImpl(definition);
  ACTION_REGISTRY.registerObject(inst);

  debugLog('Action defined:', inst.id);
}

export function defineTrigger<T extends object = {}>(
  definition: TriggerNodeDefinition
): ITriggerDefinitionContext<T> {
  if (!isTriggerNodeDefinition(definition)) {
    throw new Error('Invalid trigger node definition');
  }

  const inst = new TriggerDefinitionContext<T>(definition);
  TRIGGER_REGISTRY.registerObject(inst);

  debugLog('Trigger defined:', inst.id);

  return inst;
}
