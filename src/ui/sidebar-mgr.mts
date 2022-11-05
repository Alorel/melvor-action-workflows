import type {CategorySubitem} from 'melvor';
import LazyValue from '../lib/util/lazy-value.mjs';
import {namespace} from '../manifest.json';

export const sidebarItems = new LazyValue<Record<'dashboard' | 'newWorkflow', CategorySubitem>>(() => {
  const subitems = sidebar.category('').item('Action Workflows')
    .subitems();

  const dashId = `${namespace}:actionWorkflowsDashboard`;
  const newWorkflowId = `${namespace}:newActionWorkflow`;

  return {
    dashboard: subitems.find(i => i.id.startsWith(dashId))!,
    newWorkflow: subitems.find(i => i.id.startsWith(newWorkflowId))!,
  };
});
