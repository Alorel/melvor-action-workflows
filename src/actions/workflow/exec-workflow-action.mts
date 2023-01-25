import {takeUntil} from 'rxjs';
import {take} from 'rxjs/operators';
import type {Workflow} from '../../lib/data/workflow.mjs';
import type {WorkflowRefImpl} from '../../lib/execution/workflow-execution-ctx-impl.mjs';
import {EXTRACT_CTX_PRIVATE} from '../../lib/execution/workflow-execution-ctx-impl.mjs';
import {WorkflowExecution} from '../../lib/execution/workflow-execution.mjs';
import {InternalCategory} from '../../lib/registries/action-registry.mjs';
import WorkflowRegistry from '../../lib/registries/workflow-registry.mjs';
import {githubAsset} from '../../lib/util.mjs';
import {defineLocalAction} from '../../lib/util/define-local.mjs';
import {memoOutput} from '../../lib/util/memo.mjs';
import type {ActionNodeDefinition, Obj, StringNodeOption, WorkflowExecutionCtx} from '../../public_api';
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

const stopConditionOption: StringNodeOption = {
  description: '"Workflow completion" will execute the inner workflow until it\'s done; "Next step\'s trigger" will execute it until it completes or until the trigger for the next step fires. You CAN use a "Jump to step" action immediately following this one with the "next step trigger" option.',
  enum: {
    [StopCondition.NextStepTrigger]: 'Next step\'s trigger',
    [StopCondition.WorkflowCompletion]: 'Workflow completion',
  },
  id: 'stop',
  label: 'Stop condition',
  required: true,
  type: String,
};

const base = {
  category: InternalCategory.WORKFLOW,
  execContext: true,
  initOptions: () => ({stop: StopCondition.NextStepTrigger}),
} satisfies Partial<ActionNodeDefinition<Props>>;

defineLocalAction<Props>({
  ...base,
  description: 'Run another workflow as an action!',
  execute({name, stop}, ctx) {
    const workflow = WorkflowRegistry.inst.workflows
      .find(wf => wf.name === name);

    return executeWorkflowActionCommon(workflow, stop, ctx!);
  },
  id: ActionId.WorkflowExecWorkflow,
  label: 'Run workflow',
  media: mainIcon,
  options: [
    {
      enum: getWorkflowNames,
      id: 'name',
      label: 'Name',
      required: true,
      type: String,
    },
    stopConditionOption,
  ],
});

defineLocalAction<Props>({
  ...base,
  description: 'Similar to "Run workflow", but runs one of the workflows defined at the bottom of the page.',
  execute({name, stop}, ctx) {
    const workflow: Workflow | undefined = (ctx!.workflow as WorkflowRefImpl)
      .getEmbeddedWorkflow(name)
      ?.[EXTRACT_CTX_PRIVATE]();

    return executeWorkflowActionCommon(workflow, stop, ctx!);
  },
  id: ActionId.WorkflowExecEmbeddedWorkflow,
  label: 'Run embedded workflow',
  media: githubAsset('src/ui/assets/matryoshka.png', '0.14.0'),
  options: [
    {
      id: 'name',
      label: 'Name',
      required: true,
      type: 'EmbeddedWorkflow',
    },
    stopConditionOption,
  ],
});

function createExecution(workflow: Workflow): WorkflowExecution {
  const exec = new WorkflowExecution(workflow);
  exec.isEmbeddedRun = true;

  return exec;
}

function executeWorkflowActionCommon(
  workflow: Workflow | undefined,
  stop: StopCondition,
  ctx: WorkflowExecutionCtx
) {
  if (!workflow) {
    throw new Error('Workflow not found');
  }

  switch (stop) {
    case StopCondition.WorkflowCompletion:
      return createExecution(workflow);
    case StopCondition.NextStepTrigger: {
      const activeIdx = ctx.activeStepIdx;
      const activeWorkflow = ctx.workflow;

      let nextStep = activeWorkflow.stepAt(activeIdx + 1);
      if (!nextStep) { // Check for "jump to step" action
        const currStep = activeWorkflow.stepAt(activeIdx);
        if (!currStep) {
          throw new Error('Screwy primary execution: current step not found in steps array');
        }

        const jumpToStepAction = currStep.findActionByActionId(

          // @ts-expect-error
          ActionId.WorkflowSetStepIdx
        );

        if (!jumpToStepAction) {
          throw new Error('There is no next step');
        }

        const tryIdx: number | undefined = jumpToStepAction.opts.idx;
        if (typeof tryIdx !== 'number') {
          throw new Error('Can\'t resolve next step: jump to step index not a number');
        }

        nextStep = activeWorkflow.stepAt(tryIdx);
        if (!nextStep) {
          throw new Error('Can\'t resolve next step: jump to step index leads to nothing');
        }
      }

      return createExecution(workflow).pipe(
        takeUntil(nextStep.listen().pipe(take(1)))
      );
    }
    default:
      throw new Error(`Unknown stop condition: ${stop}`);
  }
}
