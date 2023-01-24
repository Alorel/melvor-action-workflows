/* eslint-disable max-classes-per-file */

import {LazyGetter} from 'lazy-get-decorator';
import type {Observable} from 'rxjs';
import type {ActionRef, Obj, StepRef, WorkflowExecutionCtx, WorkflowRef} from '../../public_api';
import type ActionConfigItem from '../data/action-config-item.mjs';
import type {WorkflowStep} from '../data/workflow-step.mjs';
import type {Workflow} from '../data/workflow.mjs';
import PersistClassName from '../util/decorators/PersistClassName.mjs';
import type {WorkflowExecution} from './workflow-execution.mjs';

export const EXTRACT_CTX_PRIVATE: unique symbol = Symbol('Extract Ctx Private');

@PersistClassName('WorkflowExecutionCtxImpl')
export class WorkflowExecutionCtxImpl implements WorkflowExecutionCtx {

  /** @inheritDoc */
  public readonly activeStepIdx$: Observable<number>;

  readonly #exec: WorkflowExecution;

  public constructor(execution: WorkflowExecution, public readonly stepIdx: number) {
    this.#exec = execution;
    this.activeStepIdx$ = execution.activeStepIdx$;
  }

  /** @inheritDoc */
  public get activeStepIdx(): number {
    return this.#exec.activeStepIdx;
  }

  /** @inheritDoc */
  @LazyGetter()
  public get workflow(): WorkflowRefImpl {
    return new WorkflowRefImpl(this.#exec.workflow);
  }

  /** @inheritDoc */
  public setActiveStepIdx(idx: number): void {
    this.#exec.setActiveStepIdx(idx);
  }
}

@PersistClassName('ActionRefImpl')
export class ActionRefImpl implements ActionRef {
  readonly #action: ActionConfigItem;

  public constructor(action: ActionConfigItem) {
    this.#action = action;
  }

  /** @inheritDoc */
  public get id(): string {
    return this.#action.action.id;
  }

  /** @inheritDoc */
  public get opts(): Obj<any> {
    return {...this.#action.opts};
  }
}

@PersistClassName('StepRefImpl')
export class StepRefImpl implements StepRef {
  readonly #step: WorkflowStep;

  public constructor(step: WorkflowStep) {
    this.#step = step;
  }

  /** @inheritDoc */
  public get triggerId(): string {
    return this.#step.trigger.id;
  }

  /** @inheritDoc */
  public findActionByActionId(id: string): ActionRefImpl | undefined {
    const action = this.#step.actions.find(a => a.action.id === id);
    if (action) {
      return new ActionRefImpl(action);
    }
  }

  /** @inheritDoc */
  public listen(): Observable<void> {
    return this.#step.trigger.listen();
  }
}

@PersistClassName('WorkflowRefImpl')
export class WorkflowRefImpl implements WorkflowRef {
  readonly #workflow: Workflow;

  public constructor(workflow: Workflow) {
    this.#workflow = workflow;
  }

  /** @inheritDoc */
  public get name(): string {
    return this.#workflow.name;
  }

  /** @inheritDoc */
  public get numSteps(): number {
    return this.#workflow.steps.length;
  }

  /** @inheritDoc */
  public getEmbeddedWorkflow(name: string): WorkflowRefImpl | undefined {
    const workflow = this.#workflow.embeddedWorkflows.find(wf => wf.name === name);
    if (workflow) {
      return new WorkflowRefImpl(workflow);
    }
  }

  /** @inheritDoc */
  public stepAt(idx: number): StepRefImpl | undefined {
    const step = this.#workflow.steps[idx];
    if (step) {
      return new StepRefImpl(step);
    }
  }

  public [EXTRACT_CTX_PRIVATE](): Workflow {
    return this.#workflow;
  }
}
