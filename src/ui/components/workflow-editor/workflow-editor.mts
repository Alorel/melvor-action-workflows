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
    onCancel,
    onSave,
    renderNewStep,
    workflow,
  });
}
