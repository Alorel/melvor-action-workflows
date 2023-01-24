import {BehaviorSubject} from 'rxjs';
import type {ReadonlyBehaviorSubject} from '../registries/workflow-registry.mjs';
import WorkflowRegistry from '../registries/workflow-registry.mjs';
import AutoIncrement from '../util/decorators/auto-increment.mjs';
import PersistClassName from '../util/decorators/PersistClassName.mjs';
import {DeserialisationError, toJsonMapper} from '../util/to-json.mjs';
import type {WorkflowStepJson} from './workflow-step.mjs';
import {WorkflowStep} from './workflow-step.mjs';

type Init = Partial<Pick<Workflow, 'name' | 'steps' | 'embeddedWorkflows'>>;

export type WorkflowJson = readonly [
  string, // workflow name
  readonly WorkflowStepJson[], // steps
  readonly WorkflowJson[], // embedded workflows
];

@PersistClassName('Workflow')
export class Workflow {

  public readonly embeddedWorkflows$: ReadonlyBehaviorSubject<Workflow[]>;

  @AutoIncrement()
  public readonly listId!: number;

  public name: string;

  public readonly steps$: ReadonlyBehaviorSubject<WorkflowStep[]>;

  private readonly _embeddedWorkflows$: BehaviorSubject<Workflow[]>;

  private readonly _steps$: BehaviorSubject<WorkflowStep[]>;

  public constructor({embeddedWorkflows, name, steps}: Init = {}) {
    this.name = name ?? '';
    this.steps$ = this._steps$ = new BehaviorSubject<WorkflowStep[]>(steps?.length ? steps : [new WorkflowStep()]);
    this.embeddedWorkflows$ = this._embeddedWorkflows$ = new BehaviorSubject<Workflow[]>(embeddedWorkflows ?? []);
  }

  public get canRemoveSteps(): boolean {
    return this.steps.length > 1;
  }

  public get embeddedWorkflows(): Workflow[] {
    return this._embeddedWorkflows$.value;
  }

  /** Whether this is valid as an embedded workflow */
  public get isValidAsEmbedded(): boolean {
    return this.steps.length !== 0 && this.steps.every((s): boolean => s.isValid);
  }

  public get steps(): WorkflowStep[] {
    return this._steps$.value;
  }

  public static fromJSON(input: WorkflowJson): Workflow {
    if (!Array.isArray(input)) {
      throw new DeserialisationError(input, 'Workflow input not an array');
    }

    const [
      name,
      stepsJson,
      embeddedWorkflows,
    ] = input;

    if (typeof (name as unknown) !== 'string') {
      throw new DeserialisationError(input, 'Workflow name not a string');
    }
    if (!Array.isArray(stepsJson)) {
      throw new DeserialisationError(input, `${name} workflow steps not an array`);
    }
    if (!Array.isArray(embeddedWorkflows)) {
      throw new DeserialisationError(input, `${name} embedded workflows not an array`);
    }

    return new Workflow({
      embeddedWorkflows: embeddedWorkflows.map((embeddedJson, i) => {
        try {
          return Workflow.fromJSON(embeddedJson);
        } catch (e) {
          throw new DeserialisationError(input, `Failed to deserialise ${name} embedded workflow at index ${i}:
=====
${(e as Error).stack}
===`);
        }
      }),
      name,
      steps: stepsJson.map((stepJson, i) => {
        try {
          return WorkflowStep.fromJSON(stepJson);
        } catch (e) {
          throw new DeserialisationError(input, `Failed to deserialise ${name} workflow step at index ${i}:
=====
${(e as Error).stack}
===`);
        }
      }),
    });
  }

  public addEmbeddedWorkflow(idx: number = this.embeddedWorkflows.length): void {
    const out = [...this.embeddedWorkflows];
    out.splice(idx, 0, new Workflow());
    this._embeddedWorkflows$.next(out);
  }

  public addStep(idx: number = this.steps.length): void {
    const out = [...this.steps];
    out.splice(idx, 0, new WorkflowStep());
    this._steps$.next(out);
  }

  /**
   * @param editedName Duplicate workflow names aren't permitted, but this check would trigger on itself when editing
   * a workflow, so the workflow's original name should be provided on edits so it can be used as an exception.
   */
  public isValid(editedName?: string): boolean {
    const thisName = this.name;

    return Boolean(thisName)
      && this.isValidAsEmbedded
      && this.embeddedWorkflows.every(w => w.isValidAsEmbedded)
      && (editedName === thisName || !WorkflowRegistry.inst.workflows.some(w => w.name === thisName));
  }

  /** Trigger a change on the steps observable */
  public markStepsChanged(): void {
    this._steps$.next([...this.steps]);
  }

  /** Reset the steps array to its defaults state */
  public resetSteps(): void {
    this._steps$.next([new WorkflowStep()]);
  }

  public rmEmbeddedWorkflow(idx: number): void {
    const out = [...this.embeddedWorkflows];
    out.splice(idx, 1);
    this._embeddedWorkflows$.next(out);
  }

  public rmStep(idx: number): void {
    if (!this.canRemoveSteps) {
      return;
    }

    const out = [...this.steps];
    out.splice(idx, 1);
    this._steps$.next(out);
  }

  public toJSON(): WorkflowJson {
    return [
      this.name,
      this.steps.map(toJsonMapper),
      this.embeddedWorkflows.map(toJsonMapper),
    ];
  }
}
