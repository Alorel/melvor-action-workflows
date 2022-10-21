import './actions/actions.mjs';
import {TRIGGER_REGISTRY} from './lib/registries/trigger-registry.mjs';
import WorkflowRegistry from './lib/registries/workflow-registry.mjs';
import {debugLog, errorLog} from './lib/util/log.mjs';
import './triggers/index.mjs';
import {initUi} from './ui/ui.mjs';

// ctx.api<Readonly<Api>>(api); // rollup will freeze it

let workflowRegistry: WorkflowRegistry;

ctx.onCharacterLoaded(function actionWorkflowsOnCharacterLoadedCallback() {
  try {
    workflowRegistry = WorkflowRegistry.fromStorage();
  } catch (e) {
    errorLog('Error initialising workflow registry from storage', e);

    workflowRegistry = new WorkflowRegistry([]);
  }

  debugLog('Initialised workflow registry', workflowRegistry);
});

ctx.onInterfaceReady(function actionWorkflowsOnInterfaceReadyCallback() {
  for (const {def: {enabled}, id} of TRIGGER_REGISTRY.registeredObjects.values()) {
    try {
      enabled?.();
      debugLog('Trigger initialised:', id);
    } catch (e) {
      errorLog(`Failed to initialise trigger ${id}:`, e);
    }
  }

  initUi(workflowRegistry);

  // new WorkflowExecution([
  //   {
  //     actions: [{
  //       action: ACTION_REGISTRY.getObjectByID('ActionWorkflows:startFishing')!,
  //       listId: 0,
  //       opts: {
  //         recipe: game.fishing.actions.firstObject,
  //       },
  //     }],
  //     trigger: TRIGGER_REGISTRY.getObjectByID('ActionWorkflows:lvGained')!,
  //     triggerOptions: {
  //       skill: game.woodcutting,
  //       level: 2,
  //     },
  //   },
  //   {
  //     actions: [{
  //       action: ACTION_REGISTRY.getObjectByID('ActionWorkflows:startWoodcutting')!,
  //       listId: 1,
  //       opts: {
  //         recipes: [
  //           game.woodcutting.actions.firstObject,
  //         ],
  //       },
  //     }],
  //     trigger: TRIGGER_REGISTRY.getObjectByID('ActionWorkflows:itemQty')!,
  //     triggerOptions: {
  //       item: game.items.getObjectByID('melvorD:Raw_Shrimp')!,
  //       comparator: '>=',
  //       qty: 3,
  //     },
  //   },
  // ]).start();
});
