import type {CategoryItem, CategorySubitem} from 'melvor';
import LazyValue from '../lib/util/lazy-value.mjs';
import {namespace} from '../manifest.json';

export const SIDENAV_ITEM = new LazyValue((): CategoryItem => (
  sidebar.category('').item('Action Workflows')
));
export const sidebarItems = new LazyValue<Record<'dashboard' | 'newWorkflow', CategorySubitem>>(() => {
  const subitems = SIDENAV_ITEM.value.subitems();

  const dashId = `${namespace}:actionWorkflowsDashboard`;
  const newWorkflowId = `${namespace}:newActionWorkflow`;

  return {
    dashboard: subitems.find(i => i.id.startsWith(dashId))!,
    newWorkflow: subitems.find(i => i.id.startsWith(newWorkflowId))!,
  };
});
