import {InternalCategory} from '../../lib/registries/action-registry.mjs';
import {defineLocalAction} from '../../lib/util/define-local.mjs';

interface Props {
  idx: number;
}

defineLocalAction<Props>({
  category: InternalCategory.CORE,
  execContext: true,
  execute({idx}, ctx) {
    ctx!.setActiveStepIdx(idx);
  },
  label: 'Jump to step',
  localID: 'setStepIdx',
  media: cdnMedia('assets/media/bank/Mask_of_Madness.png'),
  options: [
    {
      label: 'Step',
      localID: 'idx',
      required: true,
      type: 'StepRef',
    },
  ],
});
