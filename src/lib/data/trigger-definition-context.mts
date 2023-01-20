import {logError} from '@aloreljs/rxutils/operators';
import {noop} from 'lodash-es';
import {from, Observable} from 'rxjs';
import type {TriggerDefinitionContext as ITriggerDefinitionContext, TriggerNodeDefinition} from '../../public_api';
import {NamespacedDefinition} from '../namespaced-definition.mjs';
import {TRIGGER_REGISTRY, TriggerListener} from '../registries/trigger-registry.mjs';
import PersistClassName from '../util/decorators/PersistClassName.mjs';
import {debugLog} from '../util/log.mjs';
import {DeserialisationError} from '../util/to-json.mjs';

@PersistClassName('TriggerDefinitionContext')
export class TriggerDefinitionContext<T extends object = {}>
  extends NamespacedDefinition<TriggerNodeDefinition<T>>
  implements ITriggerDefinitionContext<T> {

  private readonly _listeners: Set<TriggerListener<T>> = new Set();

  public static fromJSON<T extends object = {}>(id: string): TriggerDefinitionContext<T> {
    const out = TRIGGER_REGISTRY.getObjectByID(id);
    if (!out) {
      throw new DeserialisationError(id, `No trigger with such ID: ${id}`);
    }

    return out;
  }

  public listen(data: T): Observable<void> {
    return new Observable<void>(subscriber => {
      debugLog(`Starting trigger listener ${this.id} with`, data);

      this.init();
      const listener = new TriggerListener(this, data, subscriber);
      this._listeners.add(listener);

      if (listener.check()) {
        listener.notify();
      }

      // If the trigger has custom listener logic, run it here
      const listenInput$ = listener.customListen();
      const sub = listenInput$
        ? from(listenInput$)
          .pipe(logError('[TriggerDefinitionCtx.listen]'))
          .subscribe(() => {
            listener.notify();
          })
        : undefined;

      return () => {
        debugLog(`Stopping trigger listener ${this.id} with`, data);
        this._listeners.delete(listener);
        sub?.unsubscribe();
      };
    });
  }

  /** @inheritDoc */
  public notifyListeners(filter: (listenerData: Readonly<T>) => any = this.def.check): void {
    for (const listener of filteredListeners(filter, this._listeners.values())) {
      listener.notify();
    }
  }

  /** A run-once method calling the definition's init function if it exists */
  private init(): void {
    this.def.init?.();
    this.init = noop;
    debugLog('Initialised trigger', this.id);
  }
}

function *filteredListeners<T extends object>(
  filter: (d: Readonly<T>) => any,
  listeners: Iterable<TriggerListener<T>>
): Iterable<TriggerListener<T>> {
  for (const listener of listeners) {
    if (!filter(listener.data)) {
      continue;
    }

    yield listener;
  }
}
