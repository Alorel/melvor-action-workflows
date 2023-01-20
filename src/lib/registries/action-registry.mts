import type {ActionNodeDefinition} from '../../public_api';
import {NamespacedDefinition} from '../namespaced-definition.mjs';
import PersistClassName from '../util/decorators/PersistClassName.mjs';
import {DeserialisationError} from '../util/to-json.mjs';

/** Some predefined categories to avoid typos */
export const enum InternalCategory {
  START_SKILL = 'Start skill',
  COMBAT = 'Combat',
  COMBINATION = 'Combination',
  CORE = 'Core',

  CURRENCY = 'Currency',
}

@PersistClassName('ActionNodeDefinitionImpl')
export class ActionNodeDefinitionImpl<T extends object> extends NamespacedDefinition<ActionNodeDefinition<T>> {

  /** @internal */
  public static fromJSON<T extends object>(id: string): ActionNodeDefinitionImpl<T> {
    const out = ACTION_REGISTRY.getObjectByID(id);
    if (!out) {
      throw new DeserialisationError(id, `No action registered with the ID ${id}`);
    }

    return out;
  }
}

/** All possible actions */
export const ACTION_REGISTRY = new NamespaceRegistry<ActionNodeDefinitionImpl<any>>(game.registeredNamespaces);
