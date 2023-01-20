import {logError} from '@aloreljs/rxutils/operators';
import {from, Observable} from 'rxjs';
import type {Obj, TriggerDefinitionContext as ITriggerDefinitionContext, TriggerNodeDefinition} from '../../public_api';
import PersistClassName from '../decorators/PersistClassName.mjs';
import type {FromJSON} from '../decorators/to-json.mjs';
import {Serialisable} from '../decorators/to-json.mjs';
import {NamespacedDefinition} from '../namespaced-definition.mjs';
import {TRIGGER_REGISTRY, TriggerListener} from '../registries/trigger-registry.mjs';
import {debugLog} from '../util/log.mjs';
import {getFromRegistryOrLog} from '../util/registry-utils/get-from-registry-or-log.mjs';

@PersistClassName('TriggerDefinitionContext')
@Serialisable<TriggerDefinitionContext<any>, string | undefined>({
  from(id) {
    if (typeof id === 'string') {
      return getFromRegistryOrLog(TRIGGER_REGISTRY, id, 'TriggerDefinitionContext');
    }
  },
  override: true,
})
export class TriggerDefinitionContext<T extends object = {}>
  extends NamespacedDefinition<TriggerNodeDefinition<T>>
  implements ITriggerDefinitionContext<T> {

  /** @internal */
  public static fromJSON: FromJSON<TriggerDefinitionContext<Obj<any>>>['fromJSON'];

  private readonly _listeners: Set<TriggerListener<T>> = new Set();

  public listen(data: T): Observable<void> {
    const listeners = this._listeners;

    return new Observable<void>(subscriber => {
      const listener = new TriggerListener(this, data, subscriber);
      debugLog(`Starting trigger listener ${this.id} with`, data);
      listeners.add(listener);

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
        listeners.delete(listener);
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
