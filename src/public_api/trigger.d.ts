import {ObservableInput} from 'rxjs';
import type {NodeDefinition} from './core';

/** Context of a defined trigger */
export class TriggerDefinitionContext<T extends object = {}> {
  /** The trigger definition */
  readonly def: TriggerNodeDefinition;

  /** The trigger ID */
  readonly id: string;

  private constructor(nope: never);

  /** Notify listeners mething the given filter function */
  public notifyListeners(filter?: (listenerData: T) => any): void;
}

/** Definition of a trigger */
export interface TriggerNodeDefinition<T extends object = {}> extends NodeDefinition<T> {
  /**
   * Some triggers, e.g. and/or, can cause infinite recursion in the UI if selected as the initial/default trigger.
   * Such triggers should have this prop set to `false`.
   * @default true
   */
  canBeDefault?: boolean;

  /**
   * Check if the given data passes the trigger. Called when a trigger node activates.
   * @param data Node data
   */
  check(data: T): boolean;

  /** Called when the mod gets enabled */
  init?(): void;

  /**
   * Override the default trigger listener logic & make the trigger fire when the returned observable emits
   */
  listen?(data: T): ObservableInput<any>;
}
