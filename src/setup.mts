import {setDefaultLogger} from '@aloreljs/rxutils';
import type {UiContext} from 'melvor';
import './actions/actions.mjs';
import {TRIGGER_REGISTRY} from './lib/registries/trigger-registry.mjs';
import {debugLog, errorLog} from './lib/util/log.mjs';
import './option-types/option-types.mjs';
import './triggers/index.mjs';
import {createPageContainerId} from './ui/common.mjs';
import WorkflowsDashboard from './ui/pages/dashboard/workflows-dashboard.mjs';
import workflowsDashboardTplId from './ui/pages/dashboard/workflows-dashboard.pug';
import NewWorkflowComponent from './ui/pages/new-workflow/new-workflow.mjs';
import newWorkflowTplId from './ui/pages/new-workflow/new-workflow.pug';
import {mainIcon} from './ui/ui.mjs';

// ctx.api<Readonly<Api>>(api); // rollup will freeze it

setDefaultLogger(errorLog);

ctx.onInterfaceReady(function actionWorkflowsOnInterfaceReadyCallback() {
  // Init triggers
  for (const {def, id} of TRIGGER_REGISTRY.registeredObjects.values()) {
    try {
      def.init();
      debugLog('Trigger initialised:', id);
    } catch (e) {
      errorLog(`Failed to initialise trigger ${id}:`, e);
    }
  }

  // Init UI
  {
    /** @return The created HTML element */
    const newPage = (id: string, ...args: Parameters<UiContext['create']>): HTMLDivElement => {
      const page = ui.create(...args).lastChild as HTMLDivElement;
      page.id = id;
      page.classList.add('d-none');

      return page;
    };
    debugLog('Initialising UI');

    sidebar
      .category('')
      .item('Action Workflows', {
        after: 'melvorD:Bank',
        icon: mainIcon,
      });

    const host = document.getElementById('main-container')!;

    newPage(createPageContainerId(workflowsDashboardTplId), WorkflowsDashboard(), host);
    newPage(createPageContainerId(newWorkflowTplId), NewWorkflowComponent(), host);
  }
});
