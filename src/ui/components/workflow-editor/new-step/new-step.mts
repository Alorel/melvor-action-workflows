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
  return `${opt.localID}@${this.step.trigger.listId}:${this.shouldShow(opt) ? 1 : 0}`;
}

function onOptionMount(this: This, opt: NodeOption, el: HTMLElement): void {
  if (!this.shouldShow(opt)) {
    el.hidden = true;
    this.step.trigger.opts[opt.localID] = undefined;
  }
}

function shouldShow(this: This, opt: NodeOption): boolean {
  return opt.showIf?.(this.step.trigger.opts) ?? true;
}

function renderTriggerSelect(this: This) {
  return TriggerSelect({
    onChange: this.onTriggerSelect,
    value: this.step.trigger.trigger,
  });
}

function renderNodeOption(this: This, option: NodeOption) {
  const [initialValue, onChange] = this.step.trigger.optionGetSet(option.localID);

  return RenderNodeOption({
    initialValue,
    onChange,
    option,
    otherValues: this.step.trigger.opts,
  });
}

function removeAction(this: This, action: ActionConfigItem): void {
  if (this.step.actions.length === 1) {
    return;
  }

  const idx = this.step.actions.findIndex(a => a.listId === action.listId);
  if (idx !== -1) {
    this.step.actions.splice(idx, 1);
  }
}

function renderAction(this: This, action: ActionConfigItem, numActions: number, idx: number) {
  const removable = numActions !== 1;
  const idxMoves: Array<1 | -1> = [];

  if (removable) {
    if (idx !== 0) {
      idxMoves.push(-1);
    }
    if (idx !== numActions - 1) {
      idxMoves.push(1);
    }
  }

  return ActionConfig({
    action,
    idxMoves,
    removable,
    remove: this.removeAction,
    shiftIdx: this.shiftIdx,
  });
}

interface Props {
  showAdd: boolean;

  showRemove: boolean;

  step: WorkflowStep;

  workflow: Workflow;
}

function shiftIdx(this: This, action: ActionConfigItem, shift: 1 | -1): void {
  const idx = this.step.actions.findIndex(a => a.listId === action.listId);
  if (idx === -1) {
    return;
  }

  if (shift === 1) {
    if (idx === this.step.actions.length - 1) {
      return;
    }

    const next = this.step.actions[idx + 1];
    this.step.actions[idx + 1] = action;
    this.step.actions[idx] = next;
  } else {
    if (idx === 0) {
      return;
    }

    const prev = this.step.actions[idx - 1];
    this.step.actions[idx - 1] = action;
    this.step.actions[idx] = prev;
  }
}

function actionOptKey(this: This, action: ActionConfigItem, numActions: number, idx: number): string {
  return `${action.listId}:${idx}:${numActions}`;
}

export default function NewStepComponent({step, workflow, showAdd, showRemove}: Props) {
  return makeComponent(`#${id}`, {
    actionOptKey,
    onOptionMount,
    onTriggerSelect,
    optKey,
    removeAction,
    renderAction,
    renderNodeOption,
    shiftIdx,
    shouldShow,
    showAdd,
    showRemove,
    step,
    triggerOptions: step.trigger?.nodeOptions ?? EMPTY_ARR,
    TriggerSelect: renderTriggerSelect,
    workflow,
  });
}
