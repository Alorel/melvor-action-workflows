import type {Observable} from 'rxjs';
import {Subject} from 'rxjs';
import {take} from 'rxjs/operators';
import LazyValue from './lazy-value.mjs';

export const tickEnd$ = new LazyValue<Observable<void>>(() => {
  const out = new Subject<void>();
  ctx.patch(Game, 'tick').after(() => {
    out.next();
  });

  return out;
});

export const nextTickEnd$ = new LazyValue<Observable<void>>(() => tickEnd$.value.pipe(take(1)));
