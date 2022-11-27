import type ActionConfigItem from '../data/action-config-item.mjs';
import type {WorkflowStep} from '../data/workflow-step.mjs';
import type {Workflow} from '../data/workflow.mjs';

export const enum WorkflowEventType {

  /** An action completed */
  ACTION_COMPLETE,

  /** Step listener started */
  STEP_LISTENING,

  /** Step listener stopped. Only emits if the active workflow step is changed forcefully */
  STEP_NOT_LISTENING,

  /** Step execution finished */
  STEP_COMPLETE,

  /** Workflow execution started */
  WORKFLOW_START,

  /** Workflow execution completed */
  WORKFLOW_COMPLETE,
}

export type WorkflowEvent = WorkflowCompleteEvent
  | WorkflowStartEvent
  | ActionExecutionEvent
  | StepListeningEvent
  | StepNotListeningEvent
  | StepCompleteEvent;

export type WorkflowCompleteEvent = WorkflowEventBase & Result<void> & {
  type: WorkflowEventType.WORKFLOW_COMPLETE;
}

export type WorkflowStartEvent = WorkflowEventBase & {
  type: WorkflowEventType.WORKFLOW_START;
}

export type StepCompleteEvent = StepEventBase & Result<void> & {
  type: WorkflowEventType.STEP_COMPLETE;
}

export interface StepListeningEvent extends StepEventBase {
  type: WorkflowEventType.STEP_LISTENING;
}

export interface StepNotListeningEvent extends StepEventBase {
  type: WorkflowEventType.STEP_NOT_LISTENING;
}

export type ActionExecutionEvent = Result<void> & Ref & {
  type: WorkflowEventType.ACTION_COMPLETE;
}

type WorkflowEventBase = Pick<StepEventBase, 'workflow'>;
type StepEventBase = Pick<Ref, 'step' | 'workflow'>;

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
