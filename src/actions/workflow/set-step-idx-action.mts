import {InternalCategory} from '../../lib/registries/action-registry.mjs';
import {defineLocalAction} from '../../lib/util/define-local.mjs';
import ActionId from '../action-id.mjs';

interface Props {
  idx: number;
}

defineLocalAction<Props>({
  category: InternalCategory.WORKFLOW,
  description: 'Forcibly make the workflow jump to another step to repeat the whole (or part of the) workflow. Note that the step cannot jump to itself.',
  execContext: true,
  execute({idx}, ctx) {
    ctx!.setActiveStepIdx(idx);
  },
  id: ActionId.WorkflowSetStepIdx,
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
