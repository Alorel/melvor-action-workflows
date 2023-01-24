import {Fragment} from 'preact';
import {timer} from 'rxjs';
import {InternalCategory} from '../../lib/registries/action-registry.mjs';
import {defineLocalAction} from '../../lib/util/define-local.mjs';
import ActionId from '../action-id.mjs';

interface Props {
  duration: number;
}

defineLocalAction<Props>({
  category: InternalCategory.CORE,
  compactRender: ({duration}) => (
    <Fragment>
      <span>{'Wait for '}</span>
      <span class={'text-primary'}>{`${duration.toLocaleString()}ms`}</span>
    </Fragment>
  ),
  execute: ({duration}) => timer(duration),
  id: ActionId.CoreDelay,
  label: 'Wait',
  media: cdnMedia('assets/media/main/timer.svg'),
  options: [
    {
      description: 'Wait for the given number of milliseconds. The actual wait may be significantly longer if the game is minimised in the browser. Does NOT work offline.',
      id: 'duration',
      label: 'Duration',
      min: 0,
      required: true,
      type: Number,
    },
  ],
});
