import {map, noop, timer} from 'rxjs';
import {InternalCategory} from '../../lib/registries/action-registry.mjs';
import {defineLocalAction} from '../../lib/util/define-local.mjs';

interface Props {
  duration: number;
}

defineLocalAction<Props>({
  category: InternalCategory.CORE,
  execute: ({duration}) => timer(duration).pipe(map(noop)),
  label: 'Wait',
  localID: 'wait',
  media: cdnMedia('assets/media/main/timer.svg'),
  options: [
    {
      description: 'Wait for the given number of milliseconds. The actual wait may be significantly longer if the game is minimised in the browser.',
      label: 'Duration',
      localID: 'duration',
      min: 0,
      required: true,
      type: Number,
    },
  ],
});
