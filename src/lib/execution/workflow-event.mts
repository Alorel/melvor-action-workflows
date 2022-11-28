import type ActionConfigItem from '../data/action-config-item.mjs';
import type {WorkflowStep} from '../data/workflow-step.mjs';
import type {Workflow} from '../data/workflow.mjs';

export const enum WorkflowEventType {

  /** An action completed */
  ACTION_COMPLETE,

  /** Step execution finished */
  STEP_COMPLETE,

  /** Step listener started */
  STEP_LISTENING,

  /** Step listener stopped. Only emits if the active workflow step is changed forcefully */
  STEP_NOT_LISTENING,

  /** Workflow execution completed */
  WORKFLOW_COMPLETE,

  /** The workflow has been reset */
  WORKFLOW_RESET,

  /** Workflow execution started */
  WORKFLOW_START,
}

export type WorkflowEvent = WorkflowCompleteEvent
  | WorkflowStartEvent
  | WorkflowResetEvent
  | ActionExecutionEvent
  | StepListeningEvent
  | StepNotListeningEvent
  | StepCompleteEvent;

export type WorkflowCompleteEvent = WorkflowEventBase<WorkflowEventType.WORKFLOW_COMPLETE> & Result<void>;

export type WorkflowResetEvent = WorkflowEventBase<WorkflowEventType.WORKFLOW_RESET>;

export type WorkflowStartEvent = WorkflowEventBase<WorkflowEventType.WORKFLOW_START>;

export type StepCompleteEvent = StepEventBase<WorkflowEventType.STEP_COMPLETE> & Result<void>;

export type StepListeningEvent = StepEventBase<WorkflowEventType.STEP_LISTENING>;

export type StepNotListeningEvent = StepEventBase<WorkflowEventType.STEP_NOT_LISTENING>;

export type ActionExecutionEvent = StepEventBase<WorkflowEventType.ACTION_COMPLETE> & Result<void> & Ref;

type WorkflowEventBase<T> = Pick<StepEventBase<T>, 'workflow' | 'type'>;

interface StepEventBase<T> extends Pick<Ref, 'step' | 'workflow'> {
  type: T;
}

interface Ref {
  action: ActionConfigItem;

  step: WorkflowStep;

  workflow: Workflow;
}

export type Result<T> = OkResult<T> | ErrResult;

type OkResult<T> = {ok: true} & (T extends void ? {result?: T} : {result: T});

interface ErrResult {
  err: string;

  ok: false;
}
