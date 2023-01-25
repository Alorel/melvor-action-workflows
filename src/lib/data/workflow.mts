import {BehaviorSubject} from 'rxjs';
import type {ReadonlyBehaviorSubject} from '../registries/workflow-registry.mjs';
import WorkflowRegistry from '../registries/workflow-registry.mjs';
import AutoIncrement from '../util/decorators/auto-increment.mjs';
import PersistClassName from '../util/decorators/PersistClassName.mjs';
import {DeserialisationError, toJsonMapper} from '../util/to-json.mjs';
import {WorkflowStep} from './workflow-step.mjs';

type Init = Partial<Pick<Workflow, 'name' | 'steps'>>;

export type WorkflowJson = ReturnType<Workflow['toJSON']>

@PersistClassName('Workflow')
export class Workflow {

  @AutoIncrement()
  public readonly listId!: number;

  public name: string;

  public readonly steps$: ReadonlyBehaviorSubject<WorkflowStep[]>;

  private readonly _steps$: BehaviorSubject<WorkflowStep[]>;

  public constructor({name, steps}: Init = {}) {
    this.name = name ?? '';
    this.steps$ = this._steps$ = new BehaviorSubject<WorkflowStep[]>(steps?.length ? steps : [new WorkflowStep()]);
  }

  public get canRemoveSteps(): boolean {
    return this.steps.length > 1;
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
    ] = input;

    if (typeof (name as unknown) !== 'string') {
      throw new DeserialisationError(input, 'Workflow name not a string');
    }
    if (!Array.isArray(stepsJson)) {
      throw new DeserialisationError(input, `${name} workflow steps not an array`);
    }

    return new Workflow({
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

    return thisName.length !== 0
      && this.steps.length !== 0
      && (editedName === thisName || !WorkflowRegistry.inst.workflows.some(w => w.name === thisName))
      && this.steps.every(s => s.isValid);
  }

  /** Trigger a change on the steps observable */
  public markStepsChanged(): void {
    this._steps$.next([...this.steps]);
  }

  /** Reset the steps array to its defaults state */
  public resetSteps(): void {
    this._steps$.next([new WorkflowStep()]);
  }

  public rmStep(idx: number): void {
    if (!this.canRemoveSteps) {
      return;
    }

    const out = [...this.steps];
    out.splice(idx, 1);
    this._steps$.next(out);
  }

  public toJSON() { // eslint-disable-line @typescript-eslint/explicit-module-boundary-types
    return [
      this.name,
      this.steps.map(toJsonMapper),
    ] as const;
  }
}
