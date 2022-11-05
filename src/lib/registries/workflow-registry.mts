import {LazyGetter} from 'lazy-get-decorator';
import type {Observable} from 'rxjs';
import {BehaviorSubject, Subject} from 'rxjs';
import {Workflow} from '../data/workflow.mjs';
import {
  compressArray,
  instantiateCompressedToJsonArray
} from '../decorators/to-json-formatters/format-to-json-array-compressed.mjs';
import {WorkflowExecution} from '../execution/workflow-execution.mjs';
import {debugLog, errorLog} from '../util/log.mjs';

const enum Strings {
  CFG_KEY = 'workflows:v2',
}

export default class WorkflowRegistry {

  private readonly _added$ = new Subject<Workflow>();

  private readonly _primaryExecution$ = new BehaviorSubject<undefined | WorkflowExecution>(undefined);

  private _workflows: Workflow[];

  private constructor(workflows: Workflow[]) {
    this._workflows = workflows;
  }

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

  @LazyGetter()
  public get onAdd$(): Observable<Workflow> {
    return this._added$.asObservable();
  }

  public get primaryExecution(): WorkflowExecution | undefined {
    return this._primaryExecution$.value;
  }

  @LazyGetter()
  public get primaryExecution$(): Observable<undefined | WorkflowExecution> {
    return this._primaryExecution$.asObservable();
  }

  public get workflows(): readonly Workflow[] {
    return this._workflows;
  }

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

  public add(workflow: Workflow): void {
    this.setWorkflows([...this.workflows, workflow]);
    this._added$.next(workflow);
  }

  public getWorkflow(listId: number): Workflow | undefined {
    return this.workflows.find(wf => wf.listId === listId);
  }

  public patch(workflow: Workflow, idx: number): void {
    if (idx >= this.workflows.length) {
      return;
    }

    const out = [...this.workflows];
    out[idx] = workflow;
    this.setWorkflows(out);
  }

  public removeByListId(listId: number): void | never {
    const idx = this.workflows.findIndex(wf => wf.listId === listId);
    if (idx !== -1) {
      const out = [...this.workflows];
      out.splice(idx, 1);
      store(out);
      this._workflows = out;
    }
  }

  public setPrimaryExecution(workflow?: Workflow): void {
    if (workflow?.listId !== this._primaryExecution$.value?.workflow.listId) {
      this._primaryExecution$.next(workflow ? new WorkflowExecution(workflow) : undefined);
    }
  }

  private setWorkflows(workflows: Workflow[]): void | never {
    workflows.sort(({name: a}, {name: b}) => a > b ? 1 : a < b ? -1 : 0);
    store(workflows);
    this._workflows = workflows;
  }
}

function store(workflows: Workflow[] | readonly Workflow[]): void | never {
  try {
    ctx.accountStorage.setItem(Strings.CFG_KEY, compressArray(workflows));
  } catch (e) {
    Swal
      .fire({
        cancelButtonColor: '#d33',
        cancelButtonText: 'Kurwa!',
        showCancelButton: true,
        showConfirmButton: false,
        text: 'Melvor mods have a 8kB storage limit and we\'ve reached it. Gonna have to delete some workflows.',
        title: 'Failed to save',
      })
      .catch(errorLog);

    throw e;
  }
}


