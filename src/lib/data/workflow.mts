import {BehaviorSubject} from 'rxjs';
import AutoIncrement from '../decorators/auto-increment.mjs';
import PersistClassName from '../decorators/PersistClassName.mjs';
import type {CompressedJsonArray} from '../decorators/to-json-formatters/format-to-json-array-compressed.mjs';
import {FormatToJsonArrayCompressed} from '../decorators/to-json-formatters/format-to-json-array-compressed.mjs';
import type {FromJSON, ToJSON} from '../decorators/to-json.mjs';
import {JsonProp, Serialisable} from '../decorators/to-json.mjs';
import type {ReadonlyBehaviorSubject} from '../registries/workflow-registry.mjs';
import WorkflowRegistry from '../registries/workflow-registry.mjs';
import {WorkflowStep} from './workflow-step.mjs';

type Init = Partial<Pick<Workflow, 'name' | 'rm' | 'steps'>>;

export interface WorkflowJson extends Pick<Workflow, 'name'> {
  steps: CompressedJsonArray<WorkflowStep>;
}

@PersistClassName('Workflow')
@Serialisable<Workflow, Init | undefined>({
  from(init) {
    if (init?.steps?.length && init.name && init.steps.every(s => (s as any) instanceof WorkflowStep)) {
      return new Workflow(init);
    }
  },
})
export class Workflow {

  /** @internal */
  public static fromJSON: FromJSON<Workflow>['fromJSON'];

  @AutoIncrement()
  public readonly listId!: number;

  @JsonProp()
  public name: string;

  @JsonProp()
  public rm: boolean;

  public readonly steps$: ReadonlyBehaviorSubject<WorkflowStep[]>;

  private readonly _steps$: BehaviorSubject<WorkflowStep[]>;

  public constructor({name, rm, steps}: Init = {}) {
    this.name = name ?? '';
    this.rm = rm ?? false;
    this.steps$ = this._steps$ = new BehaviorSubject<WorkflowStep[]>(steps?.length ? steps : [new WorkflowStep()]);
  }

  /** Reset the steps array to its defaults state */
  public resetSteps(): void {
    this._steps$.next([new WorkflowStep()]);
  }

  public get canRemoveSteps(): boolean {
    return this.steps.length > 1;
  }

  /**
   * @param editedName Duplicate workflow names aren't permitted, but this check would trigger on itself when editing
   * a workflow, so the workflow's original name should be provided on edits so it can be used as an exception.
   */
  public isValid(editedName?: string): boolean {
    return this.name.trim().length !== 0
      && this.steps.length !== 0
      && (editedName === this.name || !WorkflowRegistry.inst.workflows.some(w => w.name === editedName))
      && this.steps.every(s => s.isValid);
  }

  @JsonProp({format: FormatToJsonArrayCompressed(WorkflowStep.fromJSON)})
  public get steps(): WorkflowStep[] {
    return this._steps$.value;
  }

  public addStep(idx: number = this.steps.length): void {
    const out = [...this.steps];
    out.splice(idx, 0, new WorkflowStep());
    this._steps$.next(out);
  }

  /** Trigger a change on the steps observable */
  public markStepsChanged(): void {
    this._steps$.next([...this.steps]);
  }

  public rmStep(idx: number): void {
    if (!this.canRemoveSteps) {
      return;
    }

    const out = [...this.steps];
    out.splice(idx, 1);
    this._steps$.next(out);
  }
}

export interface Workflow extends ToJSON<WorkflowJson> {
}
