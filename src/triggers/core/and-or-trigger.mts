import {combineLatest, filter, merge, NEVER} from 'rxjs';
import {take} from 'rxjs/operators';
import type {TriggerDefinitionContext} from '../../lib/data/trigger-definition-context.mjs';
import {WorkflowTrigger} from '../../lib/data/workflow-trigger.mjs';
import {InternalCategory} from '../../lib/registries/action-registry.mjs';
import {defineLocalTrigger} from '../../lib/util/define-local.mjs';
import LazyValue from '../../lib/util/lazy-value.mjs';
import type {TriggerNodeDefinition} from '../../public_api';
import {
  allTriggerSelectGroups
} from '../../ui/components/workflow-editor/categorised-node-select/categorised-node-select-impl';

interface Data {
  triggers: WorkflowTrigger[];
}

const baseDef: Omit<TriggerNodeDefinition<Data>, 'namespace' | 'label' | 'localID' | 'check' | 'media'> = {
  canBeDefault: false,
  category: InternalCategory.COMBINATION,
  initOptions: () => ({
    triggers: [new WorkflowTrigger({trigger: defaultTrigger.value})],
  }),
  options: [
    {
      label: 'Triggers',
      localID: 'triggers',
      multi: true,
      required: true,
      type: 'TriggerRef',
    },
  ],
};

defineLocalTrigger<Data>({
  ...baseDef,
  check: ({triggers}) => triggers.every(triggerPasses),
  label: 'And',
  listen({triggers}) {
    if (!triggers.length) {
      return NEVER; // EMPTY won't work as it we're listening for completion and it completes immediately
    }

    const src$ = triggers.map(trigger => trigger.listen());

    return combineLatest(src$).pipe(

      // Check that every trigger passes
      filter(() => triggers.every(triggerPasses)),
      take(1)
    );
  },
  localID: 'and',
  media: 'https://raw.githubusercontent.com/Alorel/melvor-action-workflows/0.8.0/src/ui/assets/and.png',
});

defineLocalTrigger<Data>({
  ...baseDef,
  check: ({triggers}) => triggers.some(triggerPasses),
  label: 'Or',
  listen({triggers}) {
    if (!triggers.length) {
      return NEVER; // EMPTY won't work as it we're listening for completion and it completes immediately
    }

    const src$ = triggers.map(trigger => trigger.listen());

    // As soon as one of them emits we're good to go
    return merge(...src$).pipe(take(1));
  },
  localID: 'or',
  media: 'https://raw.githubusercontent.com/Alorel/melvor-action-workflows/0.8.0/src/ui/assets/or.png',
});

const defaultTrigger = new LazyValue<TriggerDefinitionContext<any>>(() => {
  for (const cat of allTriggerSelectGroups.value) {
    for (const trigger of cat.items) {
      if (trigger.def.canBeDefault !== false) {
        return trigger;
      }
    }
  }

  throw new Error('Can\'t resolve default and/or trigger');
});

function triggerPasses(trigger: WorkflowTrigger): boolean {
  return trigger.check();
}
