import type {
  ActionNodeDefinition,
  NodeOptionBase,
  OptionDefinition,
  TriggerDefinitionContext as ITriggerDefinitionContext,
  TriggerNodeDefinition
} from '../public_api';
import {TriggerDefinitionContext} from './data/trigger-definition-context.mjs';
import {isActionNodeDefinition, isOptionDefinition, isTriggerNodeDefinition} from './public-api-validation.mjs';
import {ACTION_REGISTRY, ActionNodeDefinitionImpl} from './registries/action-registry.mjs';
import {OPTION_REGISTRY} from './registries/option-registry.mjs';
import {TRIGGER_REGISTRY} from './registries/trigger-registry.mjs';
import {errorLog} from './util/log.mjs';

export function defineAction<T extends object = {}>(definition: ActionNodeDefinition<T>): void {
  if (!isActionNodeDefinition(definition)) {
    throw new Error('Invalid action node definition');
  }

  ACTION_REGISTRY.registerObject(new ActionNodeDefinitionImpl(definition));
}

export function defineTrigger<T extends object = {}>(
  definition: TriggerNodeDefinition<T>
): ITriggerDefinitionContext<T> {
  if (!isTriggerNodeDefinition(definition)) {
    throw new Error('Invalid trigger node definition');
  }

  const inst = new TriggerDefinitionContext<T>(definition);
  TRIGGER_REGISTRY.registerObject(inst);

  return inst;
}

export function defineOption<Val, Interface extends NodeOptionBase>(opt: OptionDefinition<Val, Interface>): void {
  if (!isOptionDefinition(opt)) {
    throw new Error('Option definition doesn\'t match schema');
  } else if (OPTION_REGISTRY.has(opt.token)) {
    errorLog(opt.token);
    throw new Error('Duplicate option token; see console.error prior');
  }

  OPTION_REGISTRY.set(opt.token, opt);
}
