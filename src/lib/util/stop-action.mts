import type {Observable} from 'rxjs';
import {defer, of, Subject, tap} from 'rxjs';
import {take} from 'rxjs/operators';
import LazyValue from './lazy-value.mjs';
import {debugLog} from './log.mjs';

const nextTick$ = new LazyValue<Subject<void>>(() => {
  const out = new Subject<void>();
  ctx.patch(Game, 'tick').after(() => {
    out.next();
  });

  return out;
});

/**
 * Gods, this thrice damned abomination of an implementation…
 * You'd expect `action.stop()` to stop the action, right? YOU FOOL.
 * The stupid game code does a ton of nonsense even after you stop the action AND gives you unrecoverable-from errors
 * to boot.
 */
export function stopAction(): Observable<void> {
  return defer(() => {
    const action: any = game.activeAction;

    if (!action) {
      debugLog('No action to stop');

      return of(undefined);
    }

    return nextTick$.value.pipe(
      take(1),
      tap(() => {
        action.stop();
      })
    );
  });
}
