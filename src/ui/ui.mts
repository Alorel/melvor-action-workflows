import {startCase} from 'lodash-es';
import {githubAsset} from '../lib/util.mjs';
import {namespace} from '../manifest.json';
import type {Obj} from '../public_api';
import './assets/styles.scss';
import {DEBUG_PAGE_ID} from './pages/debug-page';
import {HELP_PAGE_ID} from './pages/help-page';
import {IMPORT_PAGE_ID} from './pages/import-export-page';
import {NEW_WORKFLOW_PAGE_ID} from './pages/new-workflow';
import {WORKFLOWS_DASHBOARD_ID} from './pages/workflows-dashboard';

interface BaseCat {
  categoryID: string;

  itemID: string;
}

export const mainIcon = githubAsset('src/ui/assets/icon.png', '0.5.0');

// Init package
{
  const cat = <T extends object = {}>(config?: T): T & BaseCat => ({
    categoryID: '',
    itemID: startCase(namespace),
    ...config as T,
  });

  const heading = (head: string): string => `[${process.env.MELVOR_MOD_VERSION}] ${head}`;

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
      customName: heading('Action Workflows Dashboard'),
      id: 'actionWorkflowsDashboard',
      sidebarSubItems: [
        cat({name: 'Dashboard'}),
      ],
    },
    {
      ...pageCommon,
      containerID: NEW_WORKFLOW_PAGE_ID,
      customName: heading('New Action Workflow'),
      id: 'newActionWorkflow',
      sidebarSubItems: [
        cat({name: 'New Action Workflow'}),
      ],
    },
    {
      ...pageCommon,
      containerID: IMPORT_PAGE_ID,
      customName: heading('Import/export'),
      id: 'importExportWorkflows',
      sidebarSubItems: [
        cat({name: 'Import/export'}),
      ],
    },
    {
      ...pageCommon,
      containerID: HELP_PAGE_ID,
      customName: heading('Help'),
      id: 'actionWorkflowsHelp',
      sidebarSubItems: [
        cat({name: 'Help'}),
      ],
    },
  ];

  if (!process.env.PRODUCTION) {
    pages.push({
      ...pageCommon,
      containerID: DEBUG_PAGE_ID,
      customName: 'AWDev',
      id: 'actionWorkflowsDebugPage',
      sidebarSubItems: [
        cat({name: 'Action Workflows Dev'}),
      ],
    });
  }

  await ctx.gameData.addPackage({data: {pages}, namespace});
}
