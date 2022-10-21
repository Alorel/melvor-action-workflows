import {BehaviorSubject} from 'rxjs';
import {Workflow} from '../data/workflow.mjs';
import {
  compressArray,
  instantiateCompressedToJsonArray
} from '../decorators/to-json-formatters/format-to-json-array-compressed.mjs';
import {errorLog} from '../util/log.mjs';

const enum Strings {
  CFG_KEY = 'workflows:v2',
}

export default class WorkflowRegistry {
  private readonly data$: BehaviorSubject<Workflow[]>;

  public constructor(initial: Workflow[]) {
    this.data$ = new BehaviorSubject(initial);
  }

  public get workflows(): readonly Workflow[] {
    return this.data$.value;
  }

  public static fromStorage(): WorkflowRegistry {
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

    return undefined as any;
  }

  public add(workflow: Workflow): void {
    this.data$.next([...this.workflows, workflow]);
  }

  public store(): void {
    ctx.accountStorage.setItem(Strings.CFG_KEY, compressArray(this.workflows));
  }
}
