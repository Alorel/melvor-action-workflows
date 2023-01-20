import {LazyGetter} from 'lazy-get-decorator';
import type {Observable} from 'rxjs';
import {BehaviorSubject, distinctUntilChanged, map, of, switchMap} from 'rxjs';
import {getUpdateNumber, runUpdates} from '../data-update.mjs';
import type {WorkflowJson} from '../data/workflow.mjs';
import {Workflow} from '../data/workflow.mjs';
import {WorkflowExecution} from '../execution/workflow-execution.mjs';
import {alertError} from '../util/alert';
import PersistClassName from '../util/decorators/PersistClassName.mjs';
import {errorLog, warnLog} from '../util/log.mjs';

const enum StorageKey {
  WORKFLOWS = 'workflows:v2',

  DATA_VERSION = 'dataVersion',

  PRIMARY_EXECUTION = 'primaryExec',
}

interface PrimaryExecutionRef {

  /** Active step idx */
  step: number;

  /** Name */
  workflow: string;
}

export type ReadonlyBehaviorSubject<T> = Pick<BehaviorSubject<T>, 'value' | keyof Observable<T>>;

/**
 * Container for all the workflows.
 * As long as anything is subscribed to the primary execution, it'll keep on ticking.
 */
@PersistClassName('WorkflowRegistry')
export default class WorkflowRegistry {

  /** The current "main" workflow being executed */
  public readonly primaryExecution$: ReadonlyBehaviorSubject<undefined | WorkflowExecution>;

  /** All the registered workflows, as a Subject. Do NOT modify this directly without emitting a change event */
  public readonly workflows$: ReadonlyBehaviorSubject<Workflow[]>;

  /** The current "main" workflow being executed */
  private readonly _primaryExecution$: BehaviorSubject<undefined | WorkflowExecution>;

  /** All the registered workflows, as a Subject. Do NOT modify this directly without emitting a change event */
  private readonly _workflows$: BehaviorSubject<Workflow[]>;

  /** Use the singleton @ {@link #inst} */
  private constructor(
    workflows: Workflow[] = [], // eslint-disable-line default-param-last
    primaryExecution?: WorkflowExecution
  ) {
    this.primaryExecution$ = this._primaryExecution$
      = new BehaviorSubject<undefined | WorkflowExecution>(primaryExecution);
    this.workflows$ = this._workflows$ = new BehaviorSubject(workflows);
  }

  /** Singleton workflow registry instance */
  @LazyGetter()
  public static get inst(): WorkflowRegistry {
    let out: WorkflowRegistry;
    try {
      out = WorkflowRegistry.fromStorage();
    } catch (e) {
      errorLog('Error initialising workflow registry from storage', e);
      return new WorkflowRegistry();
    }

    return out;
  }

  public get primaryExecution(): undefined | WorkflowExecution {
    return this.primaryExecution$.value;
  }

  /** All the registered workflows. Do NOT modify this directly without emitting a change event */
  public get workflows(): readonly Workflow[] {
    return this._workflows$.value;
  }

  /** Load from storage */
  private static fromStorage(): WorkflowRegistry {
    // Get workflows from storage
    const raw = ctx.accountStorage.getItem<WorkflowJson[]>(StorageKey.WORKFLOWS);
    if (!raw) {
      storeDataVersion();

      return new WorkflowRegistry();
    }

    // Run data format updates
    const updateResult = runUpdates(ctx.accountStorage.getItem<number>(StorageKey.DATA_VERSION) ?? -1, raw);

    const workflowsOut: Workflow[] = [];

    // Instantiate Workflow classes
    for (const rawWF of raw) {
      try {
        workflowsOut.push(Workflow.fromJSON(rawWF));
      } catch (e) {
        errorLog('Error instantiating workflow', rawWF, 'from storage:', e);
      }
    }

    const registryOut = new WorkflowRegistry(workflowsOut, loadPrimaryExecution(workflowsOut));
    if (updateResult.applied) {
      registryOut.save();
      storeDataVersion(updateResult.update);
    }

    return registryOut;
  }

  /** Add a new workflow to the list */
  public add(first: Workflow, ...rest: Workflow[]): void;

  public add(...workflow: Workflow[]): void {
    this.setWorkflows([...this.workflows, ...workflow]);
  }

  /** Should be called ONCE, enabled offline support by subscribing to the primary execution at an appropriate time. */
  public monitorPrimaryExecutionState(): void {
    this.primaryExecution$
      .pipe(
        switchMap((exec): Observable<PrimaryExecutionRef | null> => {
          if (!exec) {
            return of(null);
          }

          // Need to subscribe to the execution itself and not just the primary step index as that's what controls ticks
          return exec.pipe(
            map(() => exec.activeStepIdx),
            distinctUntilChanged(),
            map((step): PrimaryExecutionRef | null => {
              if (step >= exec.workflow.steps.length) {
                return null;
              }

              return {
                step,
                workflow: exec.workflow.name,
              };
            })
          );
        })
      )
      .subscribe(state => {
        const storage = ctx.characterStorage;
        if (state) {
          try {
            storage.setItem(StorageKey.PRIMARY_EXECUTION, state);
          } catch (e) {
            errorLog('Failed to save primary execution state', e);
          }
        } else {
          storage.removeItem(StorageKey.PRIMARY_EXECUTION);
        }
      });
  }

  /** Overwrite the workflow at the given index */
  public patch(workflow: Workflow, idx: number): void {
    if (idx < 0 || idx >= this.workflows.length) {
      return;
    }

    // Don't patch the current workflow - unset it first
    const executedWorkflow = this.primaryExecution?.workflow?.listId;
    if (executedWorkflow && this.workflows.findIndex(w => w.listId === executedWorkflow) === idx) {
      this.setPrimaryExecution();
    }

    const out = [...this.workflows];
    out[idx] = workflow;
    this.setWorkflows(out);
  }

  /** Remove the workflow at the given index */
  public rmByIdx(idx: number): void {
    if (idx < 0 || idx >= this.workflows.length) {
      return;
    }
    const out = [...this.workflows];
    out.splice(idx, 1);
    store(out);
    this._workflows$.next(out);
  }

  public rmByListId(listId: number): void {
    const idx = this.workflows.findIndex(w => w.listId === listId);
    this.rmByIdx(idx);
  }

  /** Save the workflows to mod storage */
  public save(): void {
    store(this.workflows);
  }

  public setPrimaryExecution(workflow?: Workflow, force = false): void {
    if (force || workflow?.listId !== this.primaryExecution?.workflow.listId) {
      this._primaryExecution$.next(workflow ? new WorkflowExecution(workflow) : undefined);
    }
  }

  private setWorkflows(workflows: Workflow[]): void | never {
    workflows.sort(({name: a}, {name: b}) => a > b ? 1 : a < b ? -1 : 0);
    store(workflows);
    this._workflows$.next(workflows);
  }
}

function loadPrimaryExecution(liveWorkflows: Workflow[]): WorkflowExecution | undefined {
  const execRef = ctx.characterStorage.getItem<PrimaryExecutionRef>(StorageKey.PRIMARY_EXECUTION);
  if (!execRef) {
    return;
  }

  const workflow = liveWorkflows.find(w => w.name === execRef!.workflow);
  if (!workflow) {
    warnLog('Got primary execution', execRef, 'from storage, but the workflow can\'t be found');
    return;
  }

  return new WorkflowExecution(workflow, execRef.step);
}

function store(workflows: Workflow[] | readonly Workflow[]): void | never {
  try {
    ctx.accountStorage.setItem(StorageKey.WORKFLOWS, workflows.map(w => w.toJSON()));
  } catch (e) {
    console.error(e);
    alertError(
      'Melvor mods have a 8kB storage limit and we\'ve reached it. Gonna have to delete some workflows.',
      'Failed to save'
    );

    throw e;
  }
}

function storeDataVersion(version: number = getUpdateNumber()): void {
  try {
    ctx.accountStorage.setItem(StorageKey.DATA_VERSION, version);
  } catch (e) {
    errorLog('Error storing data version', e);
  }
}
