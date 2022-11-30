import type {WorkflowStep} from '../../../lib/data/workflow-step.mjs';
import type {Workflow} from '../../../lib/data/workflow.mjs';
import {signalContext} from '../../util/signal-context';

export const EDITOR_SECTION_CLASS = 'col-12 col-xl-11 m-auto';

const [useWorkflow, useWorkflowHost, WorkflowContext] = signalContext<Workflow>('workflow');
const [useTouched, useTouchedHost] = signalContext<boolean>('touched', false);

const [useStep, useStepHost] = signalContext<WorkflowStep>('step');

const [useActiveWorkflow, useActiveWorkflowHost] = signalContext<Workflow | undefined>('activeWorkflow');
const [useEditedWorkflow, useEditedWorkflowHost] = signalContext<Workflow | undefined>('editedWorkflow');

export {
  useActiveWorkflow,
  useActiveWorkflowHost,
  useEditedWorkflow,
  useEditedWorkflowHost,
  useStep,
  useStepHost,
  useTouched,
  useTouchedHost,
  useWorkflow,
  useWorkflowHost,
  WorkflowContext
};
