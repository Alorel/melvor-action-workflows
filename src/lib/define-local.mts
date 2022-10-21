import {namespace} from '../manifest.json';
import type {ActionNodeDefinition, TriggerNodeDefinition} from '../public_api';
import {defineAction, defineTrigger} from './api.mjs';

export function defineLocalTrigger<T extends object = {}>(
  def: Omit<TriggerNodeDefinition, 'namespace'>
): ReturnType<typeof defineTrigger<T>> {
  return defineTrigger(Object.assign(def, {namespace}));
}

export function defineLocalAction<T extends object = {}>(
  def: Omit<ActionNodeDefinition<T>, 'namespace'>
): ReturnType<typeof defineAction<T>> {
  return defineAction(Object.assign(def, {namespace}));
}
