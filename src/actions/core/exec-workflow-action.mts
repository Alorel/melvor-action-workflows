import {takeUntil} from 'rxjs';
import {take} from 'rxjs/operators';
import type {WorkflowStep} from '../../lib/data/workflow-step.mjs';
import type {Workflow} from '../../lib/data/workflow.mjs';
import {WorkflowExecution} from '../../lib/execution/workflow-execution.mjs';
import {InternalCategory} from '../../lib/registries/action-registry.mjs';
import WorkflowRegistry from '../../lib/registries/workflow-registry.mjs';
import {defineLocalAction} from '../../lib/util/define-local.mjs';
import {memoOutput} from '../../lib/util/memo.mjs';
import type {Obj} from '../../public_api';
import {mainIcon} from '../../ui/ui.mjs';
import ActionId from '../action-id.mjs';

interface Props {
  name: string;
  stop: StopCondition;
}

const enum StopCondition {
  NextStepTrigger = 's',
  WorkflowCompletion = 'w',
}

const reduceWorkflowNames = (acc: Obj<string>, {name}: Workflow): Obj<string> => {
  acc[name] = name;

  return acc;
};
const getWorkflowNames = memoOutput((): Obj<string> => (
  WorkflowRegistry.inst.workflows.reduce(reduceWorkflowNames, {})
));

defineLocalAction<Props>({
  category: InternalCategory.CORE,
  execute({name, stop}) {
    const reg = WorkflowRegistry.inst;
    const workflow = reg.workflows.find(wf => wf.name === name);

    if (!workflow) {
      throw new Error(`Workflow not found: ${name}`);
    }

    switch (stop) {
      case StopCondition.WorkflowCompletion:
        return new WorkflowExecution(workflow);
      case StopCondition.NextStepTrigger: {
        const exec = reg.primaryExecution;
        if (!exec) {
          throw new Error('There is no primary execution running');
        }

        const activeIdx = exec.activeStepIdx;
        const steps = exec.workflow.steps;

        let nextStep: WorkflowStep | undefined = steps[activeIdx + 1];
        if (!nextStep) { // Check for "jump to step" action
          const currStep = steps[activeIdx];
          if (!currStep) {
            throw new Error('Screwy primary execution: current step not found in steps array');
          }

          const jumpToStepAction = currStep.actions.find(a => (

            // @ts-expect-error
            a.action.id === ActionId.CoreSetStepIdx
          ));
          if (!jumpToStepAction) {
            throw new Error('There is no next step');
          }

          const tryIdx: number | undefined = jumpToStepAction.opts.idx;
          if (typeof tryIdx !== 'number') {
            throw new Error('Can\'t resolve next step: jump to step index not a number');
          }

          nextStep = steps[tryIdx];
          if (!nextStep) {
            throw new Error('Can\'t resolve next step: jump to step index leads to nothing');
          }
        }

        return new WorkflowExecution(workflow).pipe(
          takeUntil(nextStep.trigger.listen().pipe(take(1)))
        );
      }
      default:
        throw new Error(`Unknown stop condition: ${stop}`);
    }
  },
  id: ActionId.ExecWorkflow,
  initOptions: () => ({stop: StopCondition.NextStepTrigger}),
  label: 'Execute workflow',
  media: mainIcon,
  options: [
    {
      enum: getWorkflowNames,
      id: 'name',
      label: 'Name',
      required: true,
      type: String,
    },
    {
      description: '"Workflow completion" will execute the inner workflow until it\'s done; "Next step\'s trigger" will execute it until it completes or until the trigger for the next step fires. You CAN use a "Jump to step" action immediately following this one with the "next step trigger" option.',
      enum: {
        [StopCondition.NextStepTrigger]: 'Next step\'s trigger',
        [StopCondition.WorkflowCompletion]: 'Workflow completion',
      },
      id: 'stop',
      label: 'Stop condition',
      required: true,
      type: String,
    },
  ],
});
