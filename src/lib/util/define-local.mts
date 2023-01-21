import type ActionId from '../../actions/action-id.mjs';
import type {ActionNodeDefinition, TriggerDefinitionContext, TriggerNodeDefinition} from '../../public_api';
import type TriggerId from '../../triggers/trigger-id.mjs';
import {defineAction, defineTrigger} from '../api.mjs';

export const IS_LOCALLY_DEFINED: unique symbol = Symbol('Locally defined');

type LocalType<T, I> = Omit<T, 'id'> & {id: I | string;};

export function defineLocalTrigger<T extends object = {}>(
  def: LocalType<TriggerNodeDefinition<T>, TriggerId>
): TriggerDefinitionContext<T> {
  return patchAndPassOn(def, defineTrigger) as TriggerDefinitionContext<T>;
}

export function defineLocalAction<T extends object = {}>(
  def: LocalType<ActionNodeDefinition<T>, ActionId>
): void {
  return patchAndPassOn(def, defineAction);
}

function patchAndPassOn<T, F extends(def: T) => any>(
  def: LocalType<T, number>,
  publicFn: F
): ReturnType<F> {
  Object.defineProperty(def, IS_LOCALLY_DEFINED, {value: true});

  return publicFn(def as T);
}
