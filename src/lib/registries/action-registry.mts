import type {ActionNodeDefinition} from '../../public_api';
import type {FromJSON} from '../decorators/to-json.mjs';
import {Serialisable} from '../decorators/to-json.mjs';
import {NamespacedDefinition} from '../namespaced-definition.mjs';

export const enum InternalActionId {
  WOODCUTTING = 'startWoodcutting',
  FISHING = 'startFishing',
  FIREMAKING = 'startFiremaking',
  COOKING = 'startCooking',
}

export const enum InternalCategory {
  GATHERING = 'Gathering',
  CRAFTING = 'Crafting',
  COMBAT = 'Combat',
  CORE = 'Core',
  COMBINATION = 'Combination',
}

@Serialisable<ActionNodeDefinitionImpl<any>, string>({
  from: id => ACTION_REGISTRY.getObjectByID(id),
  override: true,
})
export class ActionNodeDefinitionImpl<T> extends NamespacedDefinition<ActionNodeDefinition<T>> {

  /** @internal */
  public static fromJSON: FromJSON<ActionNodeDefinitionImpl<any>>['fromJSON'];
}

export const ACTION_REGISTRY = new NamespaceRegistry<ActionNodeDefinitionImpl<any>>(game.registeredNamespaces);
