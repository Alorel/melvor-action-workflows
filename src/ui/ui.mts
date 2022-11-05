import {startCase} from 'lodash-es';
import {namespace} from '../manifest.json';
import './assets/styles.scss';
import {createPageContainerId} from './common.mjs';
import workflowsDashboardTplId from './pages/dashboard/workflows-dashboard.pug';
import newWorkflowTplId from './pages/new-workflow/new-workflow.pug';

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
          containerID: createPageContainerId(workflowsDashboardTplId),
          customName: 'Action Workflows Dashboard',
          id: 'actionWorkflowsDashboard',
          sidebarSubItems: [
            cat({name: 'Dashboard'}),
          ],
        },
        {
          ...pageCommon,
          containerID: createPageContainerId(newWorkflowTplId),
          customName: 'New Action Workflow',
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
