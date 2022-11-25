import {setDefaultLogger} from '@aloreljs/rxutils';
import {render} from 'preact';
import './actions/actions.mjs';
import {TRIGGER_REGISTRY} from './lib/registries/trigger-registry.mjs';
import {errorLog} from './lib/util/log.mjs';
import './option-types/option-types.mjs';
import './triggers/index.mjs';
import SidenavIcon from './ui/components/sidenav-icon';
import makePageContainer from './ui/make-page-container.mjs';
import DebugPage, {DEBUG_PAGE_ID} from './ui/pages/debug-page';
import NewWorkflow, {NEW_WORKFLOW_PAGE_ID} from './ui/pages/new-workflow';
import WorkflowsDashboard, {WORKFLOWS_DASHBOARD_ID} from './ui/pages/workflows-dashboard';
import {SIDENAV_ITEM} from './ui/sidebar-mgr.mjs';
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

  if (!process.env.PRODUCTION) {
    render(<DebugPage/>, makePageContainer(DEBUG_PAGE_ID));
  }
});

ctx.onInterfaceReady(() => {
  sidebar.category('')
    .item('Action Workflows', {
      after: 'melvorD:Bank',
      icon: mainIcon,
    });

  const iconContainer = SIDENAV_ITEM.value.iconEl;
  iconContainer.classList.remove('nav-img');
  iconContainer.innerHTML = '';

  render(<SidenavIcon/>, iconContainer);
});
