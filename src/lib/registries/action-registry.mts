import type {ActionNodeDefinition} from '../../public_api';
import PersistClassName from '../decorators/PersistClassName.mjs';
import type {FromJSON} from '../decorators/to-json.mjs';
import {Serialisable} from '../decorators/to-json.mjs';
import {NamespacedDefinition} from '../namespaced-definition.mjs';

/** Some predefined categories to avoid typos */
export const enum InternalCategory {
  START_SKILL = 'Start skill',
  COMBAT = 'Combat',
  CORE = 'Core',
}

@PersistClassName('ActionNodeDefinitionImpl')
@Serialisable<ActionNodeDefinitionImpl<any>, string>({
  from: id => ACTION_REGISTRY.getObjectByID(id),
  override: true,
})
export class ActionNodeDefinitionImpl<T extends object> extends NamespacedDefinition<ActionNodeDefinition<T>> {

  /** @internal */
  public static fromJSON: FromJSON<ActionNodeDefinitionImpl<any>>['fromJSON'];
}

/** All possible actions */
export const ACTION_REGISTRY = new NamespaceRegistry<ActionNodeDefinitionImpl<any>>(game.registeredNamespaces);
