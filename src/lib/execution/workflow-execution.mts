import {nextComplete, wasLogged} from '@aloreljs/rxutils';
import type {Observer, Subscriber, Subscription, TeardownLogic} from 'rxjs';
import {
  asapScheduler,
  catchError,
  concat,
  defer,
  EMPTY,
  from,
  last,
  map,
  Observable,
  of,
  startWith,
  throwError
} from 'rxjs';
import {switchMap, take} from 'rxjs/operators';
import type {WorkflowStep} from '../data/workflow-step.mjs';
import type {Workflow} from '../data/workflow.mjs';
import AutoIncrement from '../decorators/auto-increment.mjs';
import {debugLog, errorLog} from '../util/log.mjs';
import type {
  ActionExecutionEvent,
  StepCompleteEvent,
  StepListeningEvent,
  WorkflowCompleteEvent,
  WorkflowEvent
} from './workflow-event.mjs';
import {WorkflowEventType} from './workflow-event.mjs';

type Out = WorkflowEvent;

export class WorkflowExecution extends Observable<Out> {
  @AutoIncrement()
  public readonly id!: number;

  private _activeStepIdx = 0;

  private _events: Out[] = this.baseEvents;

  private _mainSub?: Subscription;

  private readonly _subscribers = new Set<Subscriber<Out>>();

  private readonly _mainSubObserver: Observer<Out> = {
    complete: () => {
      ++this._activeStepIdx;
      this._mainSub = asapScheduler.schedule(this.tick);
    },
    error: (e: Error) => {
      const evt = this.mkCompleteEvent(false, e.message);
      this._events.push(evt);
      for (const sub of this._subscribers) {
        sub.next(evt);
        sub.error(e);
      }
    },
    next: value => {
      this._events.push(value);
      for (const sub of this._subscribers) {
        sub.next(value);
      }
    },
  };

  public constructor(public readonly workflow: Workflow) {
    // Can't use the fn directly before calling super()
    super(subscriber => this.init(subscriber));

    this.tick = this.tick.bind(this);
  }

  public get activeStepIdx(): number {
    return this._activeStepIdx;
  }

  private get activeStep(): WorkflowStep | undefined {
    return this.workflow.steps[this._activeStepIdx];
  }

  private get baseEvents(): Out[] {
    return [{
      type: WorkflowEventType.WORKFLOW_START,
      workflow: this.workflow,
    }];
  }

  private complete(): void {
    const evt = this.mkCompleteEvent(true);
    this._events.push(evt);
    for (const sub of this._subscribers) {
      nextComplete(sub, evt);
    }
  }

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
      if (result == null) {
        return of(makeSuccessEvent());
      }

      return from(result).pipe(
        last(),
        map(() => {
          debugLog('Executed action', actionIdx, 'in workflow', this.workflow.name, 'step', stepIdx);

          return makeSuccessEvent();
        })
      );
    });

    return src$.pipe(
      catchError((e: Error) => {
        if (!wasLogged(e)) {
          errorLog(`Error executing action ${actionIdx} in workflow ${this.workflow.name} step ${stepIdx}:`, e);
        }

        return new Observable<ActionExecutionEvent>(subscriber => {
          subscriber.next({
            ...makeSuccessEvent(),
            err: e.message,
            ok: false,
          });
          subscriber.error(e);
        });
      })
    );
  }

  private executeActions(step: WorkflowStep, idx: number): Observable<ActionExecutionEvent> {
    if (!step.actions.length) {
      debugLog('No actions to execute in workflow', this.workflow);
      return EMPTY;
    }

    return concat(...step.actions.map((_, i) => this.executeAction(step, idx, i)));
  }

  private executeStep(step: WorkflowStep, idx: number): Observable<Out> {
    const baseEvt: Omit<StepListeningEvent, 'type'> = {
      step,
      workflow: this.workflow,
    };

    const exec$: Observable<Out> = step.trigger.trigger.listen(step.trigger.opts)
      .pipe(
        take(1),
        switchMap(() => this.executeActions(step, idx)),
        catchError((e: Error) => {
          if (!wasLogged(e)) {
            errorLog(`Error executing step ${idx} in workflow ${this.workflow.name}:`);
          }

          return throwError(() => e).pipe(
            startWith<StepCompleteEvent>({
              ...baseEvt,
              err: e.message,
              ok: false,
              type: WorkflowEventType.STEP_COMPLETE,
            })
          );
        })
      );

    const onSuccess$ = new Observable<StepCompleteEvent>(subscriber => {
      debugLog('Executed step', step, 'at idx', idx, 'workflow', this.workflow.name);
      nextComplete(subscriber, {
        ...baseEvt,
        ok: true,
        type: WorkflowEventType.STEP_COMPLETE,
      });
    });

    return concat(exec$, onSuccess$).pipe(
      startWith<StepListeningEvent>({
        ...baseEvt,
        type: WorkflowEventType.STEP_LISTENING,
      })
    );
  }

  private init(subscriber: Subscriber<Out>): TeardownLogic {
    this._subscribers.add(subscriber);
    for (const evt of this._events) {
      subscriber.next(evt);
    }

    if (!this._mainSub) {
      this.tick();
    }

    return () => this.tearDown(subscriber);
  }

  private mkCompleteEvent(ok: true): WorkflowCompleteEvent;

  private mkCompleteEvent(ok: false, err: string): WorkflowCompleteEvent;

  private mkCompleteEvent(ok = true, err?: string): WorkflowCompleteEvent { // eslint-disable-line default-param-last
    const base: Pick<WorkflowCompleteEvent, 'workflow' | 'type' | 'ok'> = {
      ok,
      type: WorkflowEventType.WORKFLOW_COMPLETE,
      workflow: this.workflow,
    };

    return (ok ? base : {...base, err}) as WorkflowCompleteEvent;
  }

  private tearDown(subscriber: Subscriber<Out>): void {
    this._subscribers.delete(subscriber);
    if (!this._subscribers.size) {
      this._mainSub?.unsubscribe();
      this._mainSub = undefined;
    }
  }

  private tick(): void {
    const step = this.activeStep;
    if (!step) {
      debugLog(`Completed workflow ${this.workflow.name}`);
      return this.complete();
    }

    this._mainSub = this.executeStep(step, this._activeStepIdx)
      .subscribe(this._mainSubObserver);
  }
}
