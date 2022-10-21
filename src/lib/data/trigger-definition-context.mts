import {Observable} from 'rxjs';
import type {Obj, TriggerDefinitionContext as ITriggerDefinitionContext, TriggerNodeDefinition} from '../../public_api';
import type {FromJSON} from '../decorators/to-json.mjs';
import {Serialisable} from '../decorators/to-json.mjs';
import {NamespacedDefinition} from '../namespaced-definition.mjs';
import {TRIGGER_REGISTRY} from '../registries/trigger-registry.mjs';
import {TriggerListener} from '../registries/trigger-registry/trigger-listener.mjs';
import {debugLog} from '../util/log.mjs';
import {getFromRegistryOrLog} from '../util/registry-utils.mjs';

@Serialisable<TriggerDefinitionContext<any>, string | undefined>({
  from(id) {
    if (typeof id === 'string') {
      return getFromRegistryOrLog(TRIGGER_REGISTRY, id, 'TriggerDefinitionContext');
    }
  },
  override: true,
})
export class TriggerDefinitionContext<T extends object = {}>
  extends NamespacedDefinition<TriggerNodeDefinition>
  implements ITriggerDefinitionContext<T> {

  /** @internal */
  public static fromJSON: FromJSON<TriggerDefinitionContext<Obj<any>>>['fromJSON'];

  readonly #listeners: Set<TriggerListener<T>> = new Set();

  public listen(data: T): Observable<void> {
    const listeners = this.#listeners;

    return new Observable<void>(subscriber => {
      const listener = new TriggerListener(this, data, subscriber);
      debugLog(`Starting trigger listener ${this.id} with`, data);
      listeners.add(listener);

      return () => {
        debugLog(`Stopping trigger listener ${this.id} with`, data);
        listeners.delete(listener);
      };
    });
  }

  /** @inheritDoc */
  public notifyListeners(filter?: (listenerData: Readonly<T>) => any): void {
    const listeners = this.#listeners.values();
    doNotifyListeners(filter ? filteredListeners(filter, listeners) : listeners);
  }
}

function doNotifyListeners<T extends object>(listeners: Iterable<TriggerListener<T>>): void {
  for (const listener of listeners) {
    listener.notify();
  }
}

function *filteredListeners<T extends object>(
  filter: (d: Readonly<T>) => any,
  listeners: Iterable<TriggerListener<T>>
): Iterable<TriggerListener<T>> {
  for (const listener of listeners) {
    if (filter(listener.data)) {
      yield listener;
    }
  }
}
