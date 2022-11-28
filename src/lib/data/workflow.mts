import AutoIncrement from '../decorators/auto-increment.mjs';
import PersistClassName from '../decorators/PersistClassName.mjs';
import type {CompressedJsonArray} from '../decorators/to-json-formatters/format-to-json-array-compressed.mjs';
import {FormatToJsonArrayCompressed} from '../decorators/to-json-formatters/format-to-json-array-compressed.mjs';
import type {FromJSON, ToJSON} from '../decorators/to-json.mjs';
import {JsonProp, Serialisable} from '../decorators/to-json.mjs';
import {WorkflowStep} from './workflow-step.mjs';

type Init = Partial<Pick<Workflow, 'name' | 'steps'>>;

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

  @JsonProp({format: FormatToJsonArrayCompressed(WorkflowStep.fromJSON)})
  public steps: WorkflowStep[];

  public constructor({name, steps}: Init = {}) {
    this.name = name ?? '';
    this.steps = steps?.length ? steps : [new WorkflowStep()];
  }

  public get canRemoveSteps(): boolean {
    return this.steps.length > 1;
  }

  public get isValid(): boolean {
    return this.name.trim().length !== 0
      && this.steps.length !== 0
      && this.steps.every(s => s.isValid);
  }

  public addStep(idx: number = this.steps.length): void {
    this.steps.splice(idx, 0, new WorkflowStep());
  }

  public rmStep(idx: number): void {
    if (this.canRemoveSteps) {
      this.steps.splice(idx, 1);
    }
  }
}

export interface Workflow extends ToJSON<WorkflowJson> {
}
