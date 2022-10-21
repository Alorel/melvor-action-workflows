import {startCase} from 'lodash-es';
import type {UiContext} from 'melvor';
import type WorkflowRegistry from '../lib/registries/workflow-registry.mjs';
import {debugLog} from '../lib/util/log.mjs';
import {namespace} from '../manifest.json';
import './assets/styles.scss';
import {createPageContainerId} from './common.mjs';

import NewWorkflowComponent from './pages/new-workflow/new-workflow.mjs';
import newWorkflowTplId from './pages/new-workflow/new-workflow.pug';

export interface GlobalUiState {
  workflows: WorkflowRegistry;
}

interface BaseCat {
  categoryID: string;

  itemID: string;
}

function cat<T extends object = {}>(config?: T): T & BaseCat {
  return {
    categoryID: 'Modding',
    itemID: startCase(namespace),
    ...config as T,
  };
}

const mainIcon = game.pages.getObjectByID('melvorD:Statistics')!.media;

await ctx.gameData.addPackage({
  data: {
    pages: [
      {
        canBeDefault: false,
        containerID: createPageContainerId(newWorkflowTplId),
        customName: 'New Action Workflow',
        hasGameGuide: false,
        headerBgClass: 'bg-lore',
        id: 'newActionWorkflow',
        media: mainIcon,
        sidebarSubItems: [
          cat({name: 'New Action Workflow'}),
        ],
      },
    ],
  },
  namespace,
});

export function initUi(workflowRegistry: WorkflowRegistry): void {
  /** @return The created HTML element */
  function newPage(id: string, ...args: Parameters<UiContext['create']>): HTMLDivElement {
    const page = ui.create(...args).lastChild as HTMLDivElement;
    page.id = id;
    page.classList.add('d-none');

    return page;
  }

  debugLog('Initialising UI');
  sidebar
    .category('Modding')
    .item('Action Workflows', {
      after: 'Mod Manager',
      icon: mainIcon,
    });

  const globalUiState = ui.createStore<GlobalUiState>({
    workflows: workflowRegistry,
  });

  const host = document.getElementById('main-container')!;

  newPage(createPageContainerId(newWorkflowTplId), NewWorkflowComponent(globalUiState), host);
}

