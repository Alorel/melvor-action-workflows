import {stubTrue} from 'lodash-es';
import type {TriggerDefinitionContext} from '../../lib/data/trigger-definition-context.mjs';
import {InternalCategory} from '../../lib/registries/action-registry.mjs';
import {githubAsset} from '../../lib/util.mjs';
import {defineLocalTrigger} from '../../lib/util/define-local.mjs';
import TriggerId from '../trigger-id.mjs';

export const noopTrigger = defineLocalTrigger({
  category: InternalCategory.CORE,
  check: stubTrue,
  description: 'Immediately pass without checking anything. Use as e.g. as the 1st trigger of a step that executes another workflow.',
  id: TriggerId.CoreNoop,
  label: 'Just pass',
  media: githubAsset('src/ui/assets/breeze.png', '0.15.0'),
}) as TriggerDefinitionContext;
