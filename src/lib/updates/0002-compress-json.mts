import type {DataUpdateFn} from '../data-update.mjs';
import type {ActionsConfigItemJson} from '../data/action-config-item.mjs';
import type {WorkflowStepJson} from '../data/workflow-step.mjs';
import {errorLog} from '../util/log.mjs';

/** Ensure workflow names are unique */
const update0002: DataUpdateFn = updateInput => {
  const [workflowsProps, rawWorkflows] = updateInput as [string[], any[]];
  const idxName = workflowsProps.indexOf('name');
  const idxSteps = workflowsProps.indexOf('steps');

  updateInput.splice(0, updateInput.length);

  // Convert workflows from old JSON format
  try {
    for (const raw of rawWorkflows) {
      let name: string;
      try {
        name = raw[idxName];

        const [stepProps, rawSteps] = raw[idxSteps] as [string[], any[]];
        const idxActions = stepProps.indexOf('actions');
        const idxTrigger = stepProps.indexOf('trigger');

        const steps = rawSteps
          .map((rawStep): WorkflowStepJson => {
            const [actionProps, rawActions]: [string[], any[]] = rawStep[idxActions];
            const rawTrigger = rawStep[idxTrigger];
            const idxOpts = actionProps.indexOf('opts');
            const idxId = actionProps.indexOf('action');

            // Construct step output
            const trigger = [rawTrigger.id, rawTrigger.opts] as const;
            const actions = rawActions
              .map((rawAction): ActionsConfigItemJson => {
                const opts = rawAction[idxOpts];
                const id = rawAction[idxId];

                return [id, opts];
              });

            return [trigger, actions];
          });

        updateInput.push([name, steps]);
      } catch (e) {
        errorLog(`Error converting workflow ${name!} from old JSON format`, e);
      }
    }
  } catch (e) {
    errorLog('Error converting workflow JSON format - your old workflows might be lost :(', e);
  }
};

export default update0002;
