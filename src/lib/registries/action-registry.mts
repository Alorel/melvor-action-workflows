import type {ActionNodeDefinition} from '../../public_api';
import {NamespacedDefinition} from '../namespaced-definition.mjs';
import PersistClassName from '../util/decorators/PersistClassName.mjs';
import {DeserialisationError} from '../util/to-json.mjs';
import type {StdRegistryKey} from './registries.mjs';

/** Some predefined categories to avoid typos */
export const enum InternalCategory {
  COMBAT = 'Combat',
  COMBINATION = 'Combination',
  CORE = 'Core',

  CURRENCY = 'Currency',
  START_SKILL = 'Start skill',

  WORKFLOW = 'Workflow',
}

@PersistClassName('ActionNodeDefinitionImpl')
export class ActionNodeDefinitionImpl<T extends object> extends NamespacedDefinition<ActionNodeDefinition<T>> {

  /** @internal */
  public static fromJSON<T extends object>(id: string): ActionNodeDefinitionImpl<T> {
    const out = ACTION_REGISTRY.get(id);
    if (!out) {
      throw new DeserialisationError(id, `No action registered with the ID ${id}`);
    }

    return out;
  }
}

/** All possible actions */
export const ACTION_REGISTRY = new Map<StdRegistryKey, ActionNodeDefinitionImpl<any>>();
