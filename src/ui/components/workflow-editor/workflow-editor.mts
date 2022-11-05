import {noop} from 'rxjs';
import type {WorkflowStep} from '../../../lib/data/workflow-step.mjs';
import type {Workflow} from '../../../lib/data/workflow.mjs';
import {makeComponent} from '../../common.mjs';
import NewStepComponent from './new-step/new-step.mjs';
import tplId from './workflow-editor.pug';

type This = ReturnType<typeof WorkflowEditor>;

function keyFn(this: This, step: WorkflowStep, idx: number) {
  return `${step.listId}|${idx === this.lastStepIdx ? 1 : 0}`;
}

function renderNewStep(this: This, step: WorkflowStep, showAdd: boolean) {
  return NewStepComponent({
    showAdd,
    step,
    workflow: this.workflow,
  });
}

interface Props {

  /** @default false */
  cancellable?: boolean;

  workflow: Workflow;

  /** Required if cancellable is true */
  onCancel?(): void;

  onSave(workflow: Workflow): void;
}

export default function WorkflowEditor({cancellable = false, workflow, onSave, onCancel = noop}: Props) {
  return makeComponent(`#${tplId}`, {
    cancellable,
    keyFn,
    get lastStepIdx(): number {
      return this.workflow.steps.length - 1;
    },
    onCancel,
    onSave,
    renderNewStep,
    workflow,
  });
}
