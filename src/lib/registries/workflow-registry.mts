import {LazyGetter} from 'lazy-get-decorator';
import type {Observable} from 'rxjs';
import {BehaviorSubject} from 'rxjs';
import {Workflow} from '../data/workflow.mjs';
import PersistClassName from '../decorators/PersistClassName.mjs';
import {
  compressArray,
  instantiateCompressedToJsonArray
} from '../decorators/to-json-formatters/format-to-json-array-compressed.mjs';
import {WorkflowExecution} from '../execution/workflow-execution.mjs';
import {alertError} from '../util/alert';
import {debugLog, errorLog} from '../util/log.mjs';

const enum Strings {
  CFG_KEY = 'workflows:v2',
}

export type ReadonlyBehaviorSubject<T> = Pick<BehaviorSubject<T>, 'value' | keyof Observable<T>>;

/** Container for all the workflows */
@PersistClassName('WorkflowRegistry')
export default class WorkflowRegistry {

  /** The current "main" workflow being executed */
  public readonly primaryExecution$ = new BehaviorSubject<undefined | WorkflowExecution>(undefined);

  /** All the registered workflows, as a Subject. Do NOT modify this directly without emitting a change event */
  public readonly workflows$: ReadonlyBehaviorSubject<Workflow[]>;

  /** All the registered workflows, as a Subject. Do NOT modify this directly without emitting a change event */
  private readonly _workflows$: BehaviorSubject<Workflow[]>;

  /** Use the singleton @ {@link #inst} */
  private constructor(workflows: Workflow[]) {
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
      return new WorkflowRegistry([]);
    }

    debugLog('Initialised workflow registry', out);

    return out;
  }

  /** All the registered workflows. Do NOT modify this directly without emitting a change event */
  public get workflows(): readonly Workflow[] {
    return this._workflows$.value;
  }

  /** Load from storage */
  private static fromStorage(): WorkflowRegistry {
    const out: Workflow[] = [];

    const raw = ctx.accountStorage.getItem(Strings.CFG_KEY);
    if (!raw) {
      return new WorkflowRegistry(out);
    }

    const rawWorkflows = instantiateCompressedToJsonArray(raw);
    if (!rawWorkflows) {
      errorLog('Malformed workflows in storage: not a compressed array');
      return new WorkflowRegistry(out);
    }

    for (const rawWF of rawWorkflows) {
      const instance = Workflow.fromJSON(rawWF);
      if (instance) {
        out.push(instance);
      } else {
        errorLog('Error instantiating workflow', rawWF, 'from storage: malformed data');
      }
    }

    return new WorkflowRegistry(out);
  }

  /** Add a new workflow to the list */
  public add(workflow: Workflow): void {
    this.setWorkflows([...this.workflows, workflow]);
  }

  /** Overwrite the workflow at the given index */
  public patch(workflow: Workflow, idx: number): void {
    if (idx < 0 || idx >= this.workflows.length) {
      return;
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

  /** Save the workflows to mod storage */
  public save(): void {
    store(this.workflows);
  }

  public setPrimaryExecution(workflow?: Workflow): void {
    if (workflow?.listId !== this.primaryExecution$.value?.workflow.listId) {
      this.primaryExecution$.next(workflow ? new WorkflowExecution(workflow) : undefined);
    }
  }

  private setWorkflows(workflows: Workflow[]): void | never {
    workflows.sort(({name: a}, {name: b}) => a > b ? 1 : a < b ? -1 : 0);
    store(workflows);
    this._workflows$.next(workflows);
  }
}

function store(workflows: Workflow[] | readonly Workflow[]): void | never {
  try {
    ctx.accountStorage.setItem(Strings.CFG_KEY, compressArray(workflows));
  } catch (e) {
    alertError(
      'Melvor mods have a 8kB storage limit and we\'ve reached it. Gonna have to delete some workflows.',
      'Failed to save'
    );

    throw e;
  }
}


