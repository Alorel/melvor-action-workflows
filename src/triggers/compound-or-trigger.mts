import {TriggerDefinitionContext} from '../lib/data/trigger-definition-context.mjs';
import {defineLocalTrigger} from '../lib/define-local.mjs';
import {InternalCategory} from '../lib/registries/action-registry.mjs';
import {InternalTriggerId} from '../lib/registries/trigger-registry.mjs';

export interface CompoundOrTriggerData {
  triggers: TriggerDefinitionContext[];
}

const {notifyListeners} = defineLocalTrigger<CompoundOrTriggerData>({
  category: InternalCategory.COMBINATION,
  enabled() {

  },
  label: 'Or',
  localID: InternalTriggerId.OR,
  options: [],
});
