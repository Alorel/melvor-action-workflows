import {distinctUntilChanged, filter, map, pairwise} from 'rxjs';
import {InternalCategory} from '../../lib/registries/action-registry.mjs';
import {githubAsset} from '../../lib/util.mjs';
import {defineLocalTrigger} from '../../lib/util/define-local.mjs';
import {tickEnd$} from '../../lib/util/next-tick.mjs';

function check(): boolean {
  return !game.activeAction;
}

function distinctChecker([a1, a2]: boolean[], [b1, b2]: boolean[]): boolean {
  return a1 === b1 && a2 === b2;
}

function filterFn([a, b]: boolean[]): boolean {
  return a && b;
}

defineLocalTrigger({
  category: InternalCategory.CORE,
  check,
  label: 'Idle',
  listen() {
    return tickEnd$.value
      .pipe(
        map(check),
        pairwise(),
        distinctUntilChanged(distinctChecker),
        filter(filterFn)
      );
  },
  localID: 'idle',
  media: githubAsset('src/ui/assets/lazy-peon.png', '0.12.0'),
});
