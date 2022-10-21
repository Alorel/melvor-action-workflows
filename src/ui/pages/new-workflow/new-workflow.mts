import type {WorkflowStep} from '../../../lib/data/workflow-step.mjs';
import {Workflow} from '../../../lib/data/workflow.mjs';
import {makeComponent} from '../../common.mjs';
import AutoId from '../../directives/auto-id.mjs';
import type {GlobalUiState} from '../../ui.mjs';
import NewStepComponent from './new-step/new-step.mjs';
import tplId from './new-workflow.pug';

type This = ReturnType<typeof NewWorkflowComponent>;

function renderNewStep(this: This, step: WorkflowStep, idx: number) {
  return NewStepComponent({
    removable: idx !== 0,
    showAdd: idx === this.workflow.steps.length - 1,
    step,
    workflow: this.workflow,
  });
}

export default function NewWorkflowComponent({workflows}: GlobalUiState) {
  return makeComponent(`#${tplId}`, {
    AutoId,
    renderNewStep,
    save() {
      this.workflows.add(this.workflow);
      this.workflows.store();
      this.workflow = new Workflow();
    },
    workflow: new Workflow(),
    workflows,
  });
}
