import type ActionConfigItem from '../../../../lib/data/action-config-item.mjs';
import type {TriggerDefinitionContext} from '../../../../lib/data/trigger-definition-context.mjs';
import type {WorkflowStep} from '../../../../lib/data/workflow-step.mjs';
import type {Workflow} from '../../../../lib/data/workflow.mjs';
import {EMPTY_ARR} from '../../../../lib/util.mjs';
import type {NodeOption} from '../../../../public_api';
import {makeComponent} from '../../../common.mjs';
import ActionConfig from '../action-config/action-config.mjs';
import TriggerSelect from '../categorised-node-select/trigger-select.mjs';
import RenderNodeOption from '../render-node-option/render-node-option.mjs';
import id from './new-step.pug';

type This = ReturnType<typeof NewStepComponent>;

function onTriggerSelect(this: This, v?: TriggerDefinitionContext<any>): void {
  if (v !== this.step.trigger.trigger) {
    this.step.trigger.trigger = v!;
    this.triggerOptions = this.step.trigger.nodeOptions ?? EMPTY_ARR;
    this.step.trigger.resetOpts();
  }
}

function optKey(this: This, opt: NodeOption): string {
  return `${opt.localID}@${this.step.listId}`;
}

function renderTriggerSelect(this: This) {
  return TriggerSelect({
    onChange: this.onTriggerSelect,
    value: this.step.trigger.trigger,
  });
}

function renderNodeOption(this: This, opt: NodeOption) {
  return RenderNodeOption(opt, ...this.step.trigger.optionGetSet(opt.localID));
}

function removeAction(this: This, action: ActionConfigItem): void {
  const idx = this.step.actions.indexOf(action);
  if (idx > 0) {
    this.step.actions.splice(idx, 1);
  }
}

function renderAction(this: This, action: ActionConfigItem, idx: number) {
  return ActionConfig({
    action,
    removable: idx !== 0,
    remove: this.removeAction,
  });
}

interface Props {
  step: WorkflowStep;
  workflow: Workflow;
  removable: boolean;
  showAdd: boolean;
}

export default function NewStepComponent({step, workflow, removable, showAdd}: Props) {
  return makeComponent(`#${id}`, {
    onTriggerSelect,
    optKey,
    removable,
    removeAction,
    renderAction,
    renderNodeOption,
    showAdd,
    step,
    triggerOptions: step.trigger?.nodeOptions ?? EMPTY_ARR,
    TriggerSelect: renderTriggerSelect,
    workflow,
  });
}
