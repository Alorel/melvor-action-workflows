import {combineLatest, filter, merge, NEVER} from 'rxjs';
import {take} from 'rxjs/operators';
import type {TriggerDefinitionContext} from '../lib/data/trigger-definition-context.mjs';
import {WorkflowTrigger} from '../lib/data/workflow-trigger.mjs';
import {InternalCategory} from '../lib/registries/action-registry.mjs';
import {defineLocalTrigger} from '../lib/util/define-local.mjs';
import LazyValue from '../lib/util/lazy-value.mjs';
import {
  allTriggerSelectGroups
} from '../ui/components/workflow-editor/categorised-node-select/categorised-node-select-impl';

const enum Cond {
  AND = '&&',
  OR = '||',
}

interface Data {
  cond: Cond,

  triggers: WorkflowTrigger[];
}

const triggerCtx = defineLocalTrigger<Data>({
  category: InternalCategory.CORE,
  check({cond, triggers}) {
    const method = cond === Cond.OR ? 'some' : 'every';

    // Call either Array.prototype.some or Array.prototype.every
    return triggers[method](triggerPasses);
  },
  initOptions: () => ({
    cond: Cond.AND,
    triggers: [new WorkflowTrigger({trigger: defaultTrigger.value})],
  }),
  label: 'And/or',
  listen({cond, triggers}) {
    if (!triggers.length) {
      return NEVER; // EMPTY won't work as it we're listening for completion and it completes immediately
    }

    const src$ = triggers.map(trigger => trigger.listen());

    if (cond === Cond.OR) {
      // As soon as one of them emits we're good to go
      return merge(...src$).pipe(take(1));
    }

    return combineLatest(src$).pipe(

      // Check that every trigger passes
      filter(() => triggers.every(triggerPasses)),
      take(1)
    );
  },
  localID: 'andor',
  media: cdnMedia('assets/media/pets/dragons_den.svg'),
  options: [
    {
      enum: {
        [Cond.AND]: 'And',
        [Cond.OR]: 'Or',
      },
      label: 'Check',
      localID: 'cond',
      required: true,
      type: String,
    },
    {
      label: 'Triggers',
      localID: 'triggers',
      multi: true,
      required: true,
      type: 'TriggerRef',
    },
  ],
});

const defaultTrigger = new LazyValue<TriggerDefinitionContext<any>>(() => {
  // Pick the first one that isn't our trigger node
  const ownId = triggerCtx.id;

  for (const cat of allTriggerSelectGroups.value) {
    for (const trigger of cat.items) {
      if (trigger.id !== ownId) {
        return trigger;
      }
    }
  }

  throw new Error('Can\'t resolve default and/or trigger');
});

function triggerPasses(trigger: WorkflowTrigger): boolean {
  return trigger.check();
}
