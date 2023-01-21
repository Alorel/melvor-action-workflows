import {InternalCategory} from '../../lib/registries/action-registry.mjs';
import {defineLocalAction} from '../../lib/util/define-local.mjs';
import ActionId from '../action-id.mjs';

interface Props {
  idx: number;
}

defineLocalAction<Props>({
  category: InternalCategory.CORE,
  execContext: true,
  execute({idx}, ctx) {
    ctx!.setActiveStepIdx(idx);
  },
  id: ActionId.CoreSetStepIdx,
  label: 'Jump to step',
  media: cdnMedia('assets/media/bank/Mask_of_Madness.png'),
  options: [
    {
      id: 'idx',
      label: 'Step',
      required: true,
      type: 'StepRef',
    },
  ],
});
