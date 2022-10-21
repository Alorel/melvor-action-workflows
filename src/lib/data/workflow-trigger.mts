import {Memoise} from '@aloreljs/memoise-decorator';
import {identity} from 'rxjs';
import type {NodeOption, Obj} from '../../public_api';
import {allTriggerSelectGroups} from '../../ui/pages/new-workflow/categorised-node-select/trigger-select.mjs';
import AutoIncrement from '../decorators/auto-increment.mjs';
import {FormatDeepToJsonObject} from '../decorators/to-json-formatters/format-deep-to-json-object.mjs';
import type {FromJSON, ToJSON} from '../decorators/to-json.mjs';
import {JsonProp, Serialisable} from '../decorators/to-json.mjs';
import {TRIGGER_REGISTRY} from '../registries/trigger-registry.mjs';
import {EMPTY_ARR, EMPTY_OBJ} from '../util.mjs';
import {formatOptionDefinitions, getFromRegistryOrLog} from '../util/registry-utils.mjs';
import type {TriggerDefinitionContext} from './trigger-definition-context.mjs';

type Init = Partial<Pick<WorkflowTrigger, 'trigger' | 'opts'>>;

export type WorkflowTriggerJson = Pick<WorkflowTrigger, 'opts' | 'id'>;

@Serialisable<WorkflowTrigger, Partial<WorkflowTriggerJson> | undefined>({
  from(init) {
    if (!init?.id) {
      return;
    }

    const trigger = getFromRegistryOrLog(TRIGGER_REGISTRY, init.id, 'WorkflowTrigger.trigger');
    if (!trigger) {
      return;
    }
    const out = new WorkflowTrigger({
      opts: init.opts,
      trigger,
    });

    if (formatOptionDefinitions(init, out.trigger.def.options, out.opts)) {
      return out;
    }
  },
})
export class WorkflowTrigger {

  /** @internal */
  public static fromJSON: FromJSON<WorkflowTrigger>['fromJSON'];

  @AutoIncrement()
  public readonly listId!: number;

  @JsonProp({format: FormatDeepToJsonObject()})
  public opts!: Obj<any>;

  public trigger: TriggerDefinitionContext<Obj<any>>;

  public constructor(init: Init = EMPTY_OBJ) {
    this.trigger = init.trigger ?? allTriggerSelectGroups.value[0].items[0];
    if (init.opts) {
      this.opts = init.opts;
    } else {
      this.resetOpts();
    }
  }

  @JsonProp()
  public get id(): string {
    return this.trigger.id;
  }

  public get nodeOptions(): readonly NodeOption[] {
    return this.trigger?.def.options ?? EMPTY_ARR;
  }

  public optionGetSet<T>(key: string): [T, (val: T) => void] {
    return [this.opts[key], this.getOptionSetter(key)];
  }

  public resetOpts(): void {
    this.opts = this.trigger.def.initOptions?.() ?? {};
  }

  @Memoise(identity)
  private getOptionSetter(key: string): (val: any) => void {
    return val => {
      this.opts[key] = val;
    };
  }
}

export interface WorkflowTrigger extends ToJSON<WorkflowTriggerJson> {

}
