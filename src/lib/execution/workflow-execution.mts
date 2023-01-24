import {BoundMethod} from '@aloreljs/bound-decorator';
import {Memoise} from '@aloreljs/memoise-decorator';
import {nextComplete} from '@aloreljs/rxutils';
import {logError} from '@aloreljs/rxutils/operators';
import type {MonoTypeOperatorFunction, Observer, Subscription, TeardownLogic} from 'rxjs';
import {BehaviorSubject, concat, EMPTY, filter, from, Observable, of, startWith, takeUntil, tap} from 'rxjs';
import {switchMap, take} from 'rxjs/operators';
import type {WorkflowExecutionCtx} from '../../public_api';
import {ConfigCheckboxKey} from '../../ui/components/config-checkbox';
import type ActionConfigItem from '../data/action-config-item.mjs';
import type {WorkflowStep} from '../data/workflow-step.mjs';
import type {Workflow} from '../data/workflow.mjs';
import WorkflowRegistry from '../registries/workflow-registry.mjs';
import AutoIncrement from '../util/decorators/auto-increment.mjs';
import PersistClassName from '../util/decorators/PersistClassName.mjs';
import {debugLog, errorLog} from '../util/log.mjs';
import {nextTickEnd$} from '../util/next-tick.mjs';
import prependErrorWith from '../util/rxjs/prepend-error-with.mjs';
import ShareReplayLike from '../util/share-replay-like-observable.mjs';
import type {
  ActionExecutionEvent,
  StepCompleteEvent,
  StepListeningEvent,
  WorkflowCompleteEvent,
  WorkflowEvent
} from './workflow-event.mjs';
import {WorkflowEventType} from './workflow-event.mjs';

type Out = WorkflowEvent;

const DESC_EVENTS = Object.getOwnPropertyDescriptor(ShareReplayLike.prototype, 'events')!;

/** Represents a workflow in the middle of being executed */
@PersistClassName('WorkflowTrigger')
export class WorkflowExecution extends ShareReplayLike<Out> {
  public readonly activeStepIdx$: Observable<number>;

  @AutoIncrement()
  public readonly id!: number;

  /** Set to true when it's run as part of, e.g. the exec workflow action */
  public isEmbeddedRun = false;

  /** Currently executed step index */
  private readonly _activeStepIdx$: BehaviorSubject<number>;

  /** Whether {@link #activeStepIdx} was set manually or not */
  private activeStepIdxManual = false;

  /** Set to true when {@link #end} is called */
  private finished = false;

  /** Gets set to false when the step is being set forcefully to avoid invalid updates to the active step index */
  private incrementActiveStep = true;

  /**
   * The currently executed step subscription
   * @see #tick
   */
  private mainSub?: Subscription;

  /**
   * Observer for {@link #mainSub}
   * @see #tick
   */
  private readonly mainSubObserver: Observer<Out> = {
    complete: () => {
      if (this.incrementActiveStep) {
        this.activeStepIdxManual = false;
        ++this.activeStepIdx;
      }
      this.tick();
    },
    error: (e: Error) => {
      const evt = this.mkCompleteEvent(false, e.message);
      this.events.push(evt);
      errorLog('WorkflowExecution error', e);
      for (const sub of this.subscribers) {
        nextComplete(sub, evt);
      }
    },
    next: value => {
      this.next(value);
    },
  };

  public constructor(
    public readonly workflow: Workflow,
    step = 0
  ) {
    super();
    this._activeStepIdx$ = new BehaviorSubject<number>(step);
    this.activeStepIdx$ = this._activeStepIdx$.asObservable();
  }

  /** Currently executed step index */
  public get activeStepIdx(): number {
    return this._activeStepIdx$.value;
  }

  /** Currently executed step index */
  private set activeStepIdx(v: number) {
    if (v === this.activeStepIdx) {
      return;
    }
    this._activeStepIdx$.next(v);
  }

  public get isFinished(): boolean {
    return this.finished;
  }

  public get running(): boolean {
    return !this.finished;
  }

  /** Currently executed step */
  private get activeStep(): WorkflowStep | undefined {
    return this.workflow.steps[this.activeStepIdx];
  }

  /** Should this workflow be removed on completion? */
  private get shouldRm(): boolean {
    return !this.isEmbeddedRun && Boolean(ctx.accountStorage.getItem(ConfigCheckboxKey.RM_WORKFLOW_ON_COMPLETE));
  }

  /** Set the currently executed step index. */
  @BoundMethod()
  public setActiveStepIdx(v: number): void {
    this.incrementActiveStep = false;
    this.activeStepIdxManual = true;
    try {
      this.activeStepIdx = v;
    } finally {
      this.incrementActiveStep = true;
    }
  }

  /** @inheritDoc */
  protected override cleanup(): void {
    this.mainSub?.unsubscribe();
    this.mainSub = undefined;
    if (this.finished) {
      // Restore the events prop to its initial state
      Object.defineProperty(this, 'events', DESC_EVENTS);
    }
  }

  /** @inheritDoc */
  @Memoise.all()
  protected override getOnInitEvents(): Out[] {
    return [{
      type: WorkflowEventType.WORKFLOW_START,
      workflow: this.workflow,
    }];
  }

  /** @inheritDoc */
  protected override init(): TeardownLogic {
    if (this.finished) {
      if (!this.activeStepIdxManual) {
        this.activeStepIdx = 0;
      }
      this.finished = false;
    }

    this.tick();
  }

  /** Mark the execution as complete */
  private end(): void {
    this.finished = true;
    const evt = this.mkCompleteEvent(true);
    this.events.push(evt);
    for (const sub of this.subscribers) {
      try {
        nextComplete(sub, evt);
      } catch (e) {
        errorLog('Workflow Execution end() error', e);
      }
    }

    if (this.shouldRm) {
      unsetRemoveWorkflowOnCompletion();
      WorkflowRegistry.inst.rmByListId(this.workflow.listId);
    } else {
      this.patchOnInitEventsOnEnd();
    }
  }

  /**
   * Executed a step's action
   * @param step The step containing the action
   * @param stepIdx The step's index in the workflow
   * @param actionIdx The action's index in the step
   */
  private executeAction(step: WorkflowStep, stepIdx: number, actionIdx: number): Observable<ActionExecutionEvent> {
    const action = step.actions[actionIdx];
    const logBase = `${step.actions[actionIdx]?.action.id}[${actionIdx}]@${this.workflow.name}[${stepIdx}]`;

    const src$ = new Observable<ActionExecutionEvent>(subscriber => {
      debugLog('[ExecAction] START', logBase);

      const def = action.action.def;
      const result = def
        .execute(action.opts, def.execContext ? this.makeExecCtx(stepIdx) : undefined);

      const successEvent = this.makeSuccessEvent(action, step);
      if (result == null) {
        return nextComplete(subscriber, successEvent);
      }

      return from(result)
        .subscribe({
          complete() {
            debugLog('[ExecAction] OK', logBase);
            nextComplete(subscriber, successEvent);
          },
          error: subscriber.error.bind(subscriber),
        });
    });

    return src$.pipe(
      logError(`[ExecAction] ERR ${logBase}`),
      prependErrorWith(e => of<ActionExecutionEvent>({
        ...this.makeSuccessEvent(action, step),
        err: e.message,
        ok: false,
      }))
    );
  }

  /**
   * Execute all of the step's actions
   * @param step The step containing the action
   * @param stepIdx The step's index in the workflow
   */
  private executeActions(step: WorkflowStep, stepIdx: number): Observable<ActionExecutionEvent> {
    if (!step.actions.length) {
      debugLog('No actions to execute in workflow', this.workflow);
      return EMPTY;
    }

    return concat(...step.actions.map((_, i) => this.executeAction(step, stepIdx, i)));
  }

  /**
   * Execute the step
   * @param step The step containing the action
   * @param stepIdx The step's index in the workflow
   */
  private executeStep(step: WorkflowStep, stepIdx: number): Observable<Out> {
    const baseEvt: Omit<StepListeningEvent, 'type'> = {
      step,
      workflow: this.workflow,
    };

    const exec$: Observable<Out> = step.trigger.listen()
      .pipe(
        take(1),
        switchMap(() => nextTickEnd$.value),
        switchMap(() => this.executeActions(step, stepIdx)),
        logError(`Error executing step ${stepIdx} in workflow ${this.workflow.name}:`),
        prependErrorWith(e => of<StepCompleteEvent>({
          ...baseEvt,
          err: e.message,
          ok: false,
          type: WorkflowEventType.STEP_COMPLETE,
        }))
      );

    const onSuccess$ = new Observable<StepCompleteEvent>(subscriber => {
      debugLog('Executed step', step, 'at idx', stepIdx, 'workflow', this.workflow.name);
      nextComplete(subscriber, {
        ...baseEvt,
        ok: true,
        type: WorkflowEventType.STEP_COMPLETE,
      });
    });

    const src$: Observable<Out> = concat(exec$, onSuccess$).pipe(
      startWith<StepListeningEvent>({
        ...baseEvt,
        type: WorkflowEventType.STEP_LISTENING,
      })
    );

    return this
      .ifIncomplete(src$, {
        ...baseEvt,
        type: WorkflowEventType.STEP_NOT_LISTENING,
      })
      .pipe(this.whileStepIs(stepIdx));
  }

  /** Emit the given event if the source gets unsubscribed from without completing */
  private ifIncomplete<V>(src: Observable<V>, thenEmitEvent: WorkflowEvent): Observable<V> {
    return new Observable<V>(subscriber => {
      let completed = false;
      const flagComplete = (): void => {
        completed = true;
      };
      const sub = src
        .pipe(tap({complete: flagComplete, error: flagComplete}))
        .subscribe(subscriber);

      return () => {
        if (!completed) {
          this.next(thenEmitEvent);
        }

        sub.unsubscribe();
      };
    });
  }

  /** Create a {@link WorkflowExecutionCtx} for the current step */
  private makeExecCtx(stepIdx: number): WorkflowExecutionCtx {
    return {
      activeStepIdx$: this.activeStepIdx$,
      numSteps: this.workflow.steps.length,
      setActiveStepIdx: this.setActiveStepIdx,
      stepIdx,
    };
  }

  @BoundMethod()
  private makeSuccessEvent(action: ActionConfigItem, step: WorkflowStep): ActionExecutionEvent {
    return {
      action,
      ok: true,
      step,
      type: WorkflowEventType.ACTION_COMPLETE,
      workflow: this.workflow,
    };
  }

  /** Create a successful workflow completion event */
  private mkCompleteEvent(ok: true): WorkflowCompleteEvent;

  /** Create a failed workflow completion event */
  private mkCompleteEvent(ok: false, err: string): WorkflowCompleteEvent;

  private mkCompleteEvent(ok = true, err?: string): WorkflowCompleteEvent { // eslint-disable-line default-param-last
    const base: Pick<WorkflowCompleteEvent, 'workflow' | 'type' | 'ok'> = {
      ok,
      type: WorkflowEventType.WORKFLOW_COMPLETE,
      workflow: this.workflow,
    };

    return (ok ? base : {...base, err}) as WorkflowCompleteEvent;
  }

  /** Patch {@link #getOnInitEvents} to also emit a workflow reset event */
  @Memoise.all()
  private patchOnInitEventsOnEnd(): void {
    this.getOnInitEvents().unshift({
      type: WorkflowEventType.WORKFLOW_RESET,
      workflow: this.workflow,
    });
  }

  /** Main ticking function for the workflow */
  private tick(): void {
    const step = this.activeStep;
    if (!step) {
      debugLog(`Completed workflow ${this.workflow.name}`);
      return this.end();
    }

    this.mainSub = this.executeStep(step, this.activeStepIdx)
      .subscribe(this.mainSubObserver);
  }

  /** Shortcut for `takeUntil(activeStepIdx !== idx)` */
  private whileStepIs<T>(idx: number): MonoTypeOperatorFunction<T> {
    return takeUntil(this._activeStepIdx$.pipe(filter(i => i !== idx)));
  }
}

function unsetRemoveWorkflowOnCompletion(): void {
  ctx.accountStorage.removeItem(ConfigCheckboxKey.RM_WORKFLOW_ON_COMPLETE);
}
