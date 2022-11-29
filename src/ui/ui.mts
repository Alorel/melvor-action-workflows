import {startCase} from 'lodash-es';
import {namespace} from '../manifest.json';
import type {Obj} from '../public_api';
import './assets/styles.scss';
import {DEBUG_PAGE_ID} from './pages/debug-page';
import {NEW_WORKFLOW_PAGE_ID} from './pages/new-workflow';
import {WORKFLOWS_DASHBOARD_ID} from './pages/workflows-dashboard';

interface BaseCat {
  categoryID: string;

  itemID: string;
}

export const mainIcon = 'https://i.imgur.com/fMgInFq.png';

// Init package
{
  const cat = <T extends object = {}>(config?: T): T & BaseCat => ({
    categoryID: '',
    itemID: startCase(namespace),
    ...config as T,
  });

  const pageCommon = {
    canBeDefault: false,
    hasGameGuide: false,
    headerBgClass: 'bg-lore',
    media: mainIcon,
  };

  const pages: Array<Obj<any>> = [
    {
      ...pageCommon,
      containerID: WORKFLOWS_DASHBOARD_ID,
      customName: `[${process.env.MELVOR_MOD_VERSION}] Action Workflows Dashboard`,
      id: 'actionWorkflowsDashboard',
      sidebarSubItems: [
        cat({name: 'Dashboard'}),
      ],
    },
    {
      ...pageCommon,
      containerID: NEW_WORKFLOW_PAGE_ID,
      customName: `[${process.env.MELVOR_MOD_VERSION}] New Action Workflow`,
      id: 'newActionWorkflow',
      sidebarSubItems: [
        cat({name: 'New Action Workflow'}),
      ],
    },
  ];

  if (!process.env.PRODUCTION) {
    pages.push({
      ...pageCommon,
      containerID: DEBUG_PAGE_ID,
      customName: `v${process.env.MELVOR_MOD_VERSION}`,
      id: 'actionWorkflowsDebugPage',
      sidebarSubItems: [
        cat({name: 'Action Workflows Dev'}),
      ],
    });
  }

  await ctx.gameData.addPackage({data: {pages}, namespace});
}
