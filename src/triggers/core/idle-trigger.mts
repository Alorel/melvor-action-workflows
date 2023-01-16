import {EMPTY, filter, switchMap} from 'rxjs';
import {InternalCategory} from '../../lib/registries/action-registry.mjs';
import {defineLocalTrigger} from '../../lib/util/define-local.mjs';
import {nextTickStart$, tickEnd$} from '../../lib/util/next-tick.mjs';

defineLocalTrigger({
  category: InternalCategory.CORE,
  check: () => !game.activeAction,
  label: 'Idle',
  listen() {
    const ifHasAction$ = nextTickStart$.value.pipe(filter(() => !game.activeAction));

    return tickEnd$.value
      .pipe(
        switchMap(() => game.activeAction ? EMPTY : ifHasAction$)
      );
  },
  localID: 'idle',
  media: 'https://raw.githubusercontent.com/Alorel/melvor-action-workflows/0.12.0/src/ui/assets/lazy-peon.png',
});
