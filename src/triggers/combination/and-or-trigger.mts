import {combineLatest, filter, merge, NEVER} from 'rxjs';
import {WorkflowTrigger} from '../../lib/data/workflow-trigger.mjs';
import {InternalCategory} from '../../lib/registries/action-registry.mjs';
import {githubAsset} from '../../lib/util.mjs';
import {defineLocalTrigger} from '../../lib/util/define-local.mjs';
import type {TriggerNodeDefinition} from '../../public_api';
import TriggerId from '../trigger-id.mjs';

interface Data {
  triggers: WorkflowTrigger[];
}

const baseDef = {
  category: InternalCategory.COMBINATION,
  initOptions: () => ({triggers: [new WorkflowTrigger()]}),
  options: [
    {
      id: 'triggers',
      label: 'Triggers',
      multi: true,
      required: true,
      type: 'TriggerRef',
    },
  ],
} satisfies Partial<TriggerNodeDefinition<Data>>;

defineLocalTrigger<Data>({
  ...baseDef,
  check: ({triggers}) => triggers.every(triggerPasses),
  id: TriggerId.CombinationAnd,
  label: 'And',
  listen({triggers}) {
    switch (triggers.length) {
      case 0:
        return NEVER; // EMPTY won't work as it we're listening for completion and it completes immediately;
      case 1: {
        const trigger = triggers[0];

        return trigger.listen().pipe(filter(() => trigger.check()));
      }
      default: {
        const src$ = triggers.map(trigger => trigger.listen());

        return combineLatest(src$).pipe(

          // Check that every trigger passes
          filter(() => triggers.every(triggerPasses))
        );
      }
    }
  },
  media: githubAsset('src/ui/assets/and.png', '0.8.0'),
});

defineLocalTrigger<Data>({
  ...baseDef,
  check: ({triggers}) => triggers.some(triggerPasses),
  id: TriggerId.CombinationOr,
  label: 'Or',
  listen({triggers}) {
    return triggers.length
      ? merge(...triggers.map(trigger => trigger.listen()))
      : NEVER;
  },
  media: githubAsset('src/ui/assets/or.png', '0.8.0'),
});

function triggerPasses(trigger: WorkflowTrigger): boolean {
  return trigger.check();
}
