import {startCase} from 'lodash-es';
import {namespace} from '../manifest.json';
import './assets/styles.scss';
import {NEW_WORKFLOW_PAGE_ID} from './pages/new-workflow';
import {WORKFLOWS_DASHBOARD_ID} from './pages/workflows-dashboard';

interface BaseCat {
  categoryID: string;

  itemID: string;
}

export const mainIcon = game.items.getObject('melvorD', 'Rubber_Ducky')!.media;

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

  await ctx.gameData.addPackage({
    data: {
      pages: [
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
      ],
    },
    namespace,
  });
}
