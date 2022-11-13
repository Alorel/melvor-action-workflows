import {noop} from 'rxjs';
import type {WorkflowStep} from '../../../lib/data/workflow-step.mjs';
import type {Workflow} from '../../../lib/data/workflow.mjs';
import {makeComponent} from '../../common.mjs';
import NewStepComponent from './new-step/new-step.mjs';
import tplId from './workflow-editor.pug';

type This = ReturnType<typeof WorkflowEditor>;

function keyFn(this: This, step: WorkflowStep, idx: number) {
  return `${step.listId}|${idx === this.workflow.lastStepIdx ? 1 : 0}|${this.workflow.canRemoveSteps ? 1 : 0}`;
}

function renderNewStep(this: This, step: WorkflowStep, showAdd: boolean, showRemove: boolean) {
  return NewStepComponent({
    showAdd,
    showRemove,
    step,
    workflow: this.workflow,
  });
}

function onSave(this: This): void {
  const wf = this.workflow;

  // validate
  if (wf.name.trim() && wf.steps.every(s => s.isValid)) {
    this._onSave(this.workflow);
  } else {
    this.touched = true;
  }
}

interface Props {

  /** @default false */
  cancellable?: boolean;

  workflow: Workflow;

  /** Required if cancellable is true */
  onCancel?(): void;

  onSave(workflow: Workflow): void;
}

export default function WorkflowEditor({cancellable = false, workflow, onSave: _onSave, onCancel = noop}: Props) {
  return makeComponent(`#${tplId}`, {
    _onSave,
    cancellable,
    keyFn,
    onCancel,
    onSave,
    renderNewStep,
    touched: false,
    workflow,
  });
}
