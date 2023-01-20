import {EMPTY_OBJ} from '../util.mjs';
import AutoIncrement from '../util/decorators/auto-increment.mjs';
import PersistClassName from '../util/decorators/PersistClassName.mjs';
import {DeserialisationError, toJsonMapper} from '../util/to-json.mjs';
import ActionConfigItem from './action-config-item.mjs';
import {WorkflowTrigger} from './workflow-trigger.mjs';

type Init = Partial<Pick<WorkflowStep, 'actions' | 'trigger'>>;

export type WorkflowStepJson = ReturnType<WorkflowStep['toJSON']>;

@PersistClassName('Workflow')
export class WorkflowStep {

  public actions: ActionConfigItem[];

  @AutoIncrement()
  public readonly listId!: number;

  public trigger: WorkflowTrigger;

  public constructor(init: Init = EMPTY_OBJ) {
    this.actions = init.actions?.length ? init.actions : [new ActionConfigItem()];
    this.trigger = init.trigger ?? new WorkflowTrigger();
  }

  public get isValid(): boolean {
    return this.actions.length !== 0 && this.trigger.isValid
      && this.actions.every(a => a?.isValid);
  }

  public static fromJSON(input: WorkflowStepJson): WorkflowStep {
    if (!Array.isArray(input)) {
      throw new DeserialisationError(input, 'Step input not an array');
    }

    const [
      triggerJson,
      actionsJson,
    ] = input;

    if (!Array.isArray(actionsJson)) {
      throw new DeserialisationError(input, 'Actions not an array');
    }
    if (!actionsJson.length) {
      throw new DeserialisationError(input, 'Actions array empty');
    }

    let trigger: WorkflowTrigger;
    try {
      trigger = WorkflowTrigger.fromJSON(triggerJson);
    } catch (e) {
      throw new DeserialisationError(input, `Failed deserialising step trigger:\n=====${(e as Error).stack}\n===`);
    }

    const actions = actionsJson.map((actionJson, i) => {
      try {
        return ActionConfigItem.fromJSON(actionJson);
      } catch (e) {
        throw new DeserialisationError(input, `Failed to deserialise step action at index ${i}:
=====
${(e as Error).stack}
===`);
      }
    });

    return new WorkflowStep({
      actions,
      trigger,
    });
  }

  public addAction(): void {
    this.actions.push(new ActionConfigItem());
  }

  public toJSON() { // eslint-disable-line @typescript-eslint/explicit-module-boundary-types
    return [
      this.trigger.toJSON(),
      this.actions.map(toJsonMapper),
    ] as const;
  }
}
