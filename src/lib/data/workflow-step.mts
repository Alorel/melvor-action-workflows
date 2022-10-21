import AutoIncrement from '../decorators/auto-increment.mjs';
import {FormatToJsonArrayCompressed} from '../decorators/to-json-formatters/format-to-json-array-compressed.mjs';
import {FormatToJson} from '../decorators/to-json-formatters/format-to-json.mjs';
import type {FromJSON, ToJSON} from '../decorators/to-json.mjs';
import {JsonProp, Serialisable} from '../decorators/to-json.mjs';
import {EMPTY_OBJ} from '../util.mjs';
import ActionConfigItem from './action-config-item.mjs';
import type {WorkflowTriggerJson} from './workflow-trigger.mjs';
import {WorkflowTrigger} from './workflow-trigger.mjs';

type Init = Partial<Pick<WorkflowStep, 'actions' | 'trigger'>>;

export interface WorkflowStepJson {
  actions: WorkflowTriggerJson[];
}

@Serialisable<WorkflowStep, Partial<Init> | undefined>({
  from(init) {
    if (init?.actions?.length && init.trigger && init.actions.every(a => (a as any) instanceof ActionConfigItem)) {
      return new WorkflowStep(init);
    }
  },
})
export class WorkflowStep {

  /** @internal */
  public static fromJSON: FromJSON<WorkflowStep>['fromJSON'];

  @JsonProp({format: FormatToJsonArrayCompressed(ActionConfigItem.fromJSON)})
  public actions: ActionConfigItem[];

  @AutoIncrement()
  public readonly listId!: number;

  @JsonProp({format: FormatToJson(WorkflowTrigger.fromJSON)})
  public trigger: WorkflowTrigger;

  public constructor(init: Init = EMPTY_OBJ) {
    this.actions = init.actions?.length ? init.actions : [new ActionConfigItem()];
    this.trigger = init.trigger ?? new WorkflowTrigger();
  }

  public addAction(): void {
    this.actions.push(new ActionConfigItem());
  }
}

export interface WorkflowStep extends ToJSON <WorkflowStepJson> {
}
