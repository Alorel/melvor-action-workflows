import {setDefaultLogger} from '@aloreljs/rxutils';
import {render} from 'preact';
import './actions/actions.mjs';
import {TRIGGER_REGISTRY} from './lib/registries/trigger-registry.mjs';
import {errorLog} from './lib/util/log.mjs';
import './option-types/option-types.mjs';
import './triggers/index.mjs';
import makePageContainer from './ui/make-page-container.mjs';
import NewWorkflow, {NEW_WORKFLOW_PAGE_ID} from './ui/pages/new-workflow';
import WorkflowsDashboard, {WORKFLOWS_DASHBOARD_ID} from './ui/pages/workflows-dashboard';
import {mainIcon} from './ui/ui.mjs';

// ctx.api<Readonly<Api>>(api); // rollup will freeze it

setDefaultLogger(errorLog);

ctx.onInterfaceAvailable(() => {
  for (const {def, id} of TRIGGER_REGISTRY.registeredObjects.values()) {
    try {
      def.init();
    } catch (e) {
      errorLog(`Failed to initialise trigger ${id}:`, e);
    }
  }

  render(<NewWorkflow/>, makePageContainer(NEW_WORKFLOW_PAGE_ID));
  render(<WorkflowsDashboard/>, makePageContainer(WORKFLOWS_DASHBOARD_ID));
});

ctx.onInterfaceReady(() => {
  sidebar
    .category('')
    .item('Action Workflows', {
      after: 'melvorD:Bank',
      icon: mainIcon,
    });
});
