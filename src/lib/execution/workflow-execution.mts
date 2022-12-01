import {Memoise} from '@aloreljs/memoise-decorator';
import {nextComplete} from '@aloreljs/rxutils';
import {logError} from '@aloreljs/rxutils/operators';
import type {MonoTypeOperatorFunction, Observer, Subscription, TeardownLogic} from 'rxjs';
import {
  asapScheduler,
  asyncScheduler,
  BehaviorSubject,
  concat,
  defer,
  EMPTY,
  filter,
  from,
  last,
  map,
  Observable,
  of,
  scheduled,
  startWith,
  takeUntil,
  tap
} from 'rxjs';
import {switchMap, take} from 'rxjs/operators';
import type {WorkflowStep} from '../data/workflow-step.mjs';
import type {Workflow} from '../data/workflow.mjs';
import AutoIncrement from '../decorators/auto-increment.mjs';
import PersistClassName from '../decorators/PersistClassName.mjs';
import {debugLog, errorLog} from '../util/log.mjs';
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

/** Represents a workflow in the middle of being executed */
@PersistClassName('WorkflowTrigger')
export class WorkflowExecution extends ShareReplayLike<Out> {
  @AutoIncrement()
  public readonly id!: number;

  /** Currently executed step index */
  private readonly _activeStepIdx$ = new BehaviorSubject<number>(0);

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
      this.mainSub = asapScheduler.schedule(this.tick);
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

  public constructor(public readonly workflow: Workflow) {
    super();
    this.tick = this.tick.bind(this);
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

  /** Currently executed step */
  private get activeStep(): WorkflowStep | undefined {
    return this.workflow.steps[this.activeStepIdx];
  }

  /** Set the currently executed step index. */
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

    this.patchOnInitEventsOnEnd();
  }

  /**
   * Executed a step's action
   * @param step The step containing the action
   * @param stepIdx The step's index in the workflow
   * @param actionIdx The action's index in the step
   */
  private executeAction(step: WorkflowStep, stepIdx: number, actionIdx: number): Observable<ActionExecutionEvent> {
    const action = step.actions[actionIdx];
    const makeSuccessEvent = (): ActionExecutionEvent => ({
      action,
      ok: true,
      step,
      type: WorkflowEventType.ACTION_COMPLETE,
      workflow: this.workflow,
    });

    const src$ = defer((): Observable<ActionExecutionEvent> => {
      const result = action.action.def.execute(action.opts);

      return result == null
        ? of(makeSuccessEvent())
        : from(result).pipe(last(null, null), map(makeSuccessEvent));
    });

    return src$.pipe(
      tap(() => {
        debugLog('Executed action', actionIdx, 'in workflow', this.workflow.name, 'step', stepIdx);
      }),
      logError(`[Exec action ${step.actions[actionIdx]?.action.id}[${actionIdx}]@${this.workflow.name}[${stepIdx}]]`),
      prependErrorWith(e => of<ActionExecutionEvent>({
        ...makeSuccessEvent(),
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

    const trigger$ = step.trigger.trigger.listen(step.trigger.opts).pipe(take(1));

    const exec$: Observable<Out> = scheduled(trigger$, asyncScheduler)
      .pipe(
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

const DESC_EVENTS = Object.getOwnPropertyDescriptor(WorkflowExecution.prototype, 'events')!;
