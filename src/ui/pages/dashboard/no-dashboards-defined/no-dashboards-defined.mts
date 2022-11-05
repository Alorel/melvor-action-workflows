import {makeComponent} from '../../../common.mjs';
import {sidebarItems} from '../../../sidebar-mgr.mjs';
import id from './no-dashboards-defined.pug';

export default function NoDashboardsDefined() {
  return makeComponent(`#${id}`, {
    openNewWorkflowPage(evt: Event): void {
      evt.preventDefault();
      sidebarItems.value.newWorkflow.click();
    },
  });
}
