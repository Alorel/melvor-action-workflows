import type {TriggerDefinitionContext} from '../data/trigger-definition-context.mjs';

export const enum InternalTriggerId {
  LEVEL_GAINED = 'lvGained',
  ITEM_QTY = 'itemQty',
  OR = 'or',
}

export const TRIGGER_REGISTRY = new NamespaceRegistry<TriggerDefinitionContext<any>>(game.registeredNamespaces);
