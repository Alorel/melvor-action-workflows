import type {Observable} from 'rxjs';
import type {NodeOption, Obj} from '../../public_api';
import {
  allTriggerSelectGroups
} from '../../ui/components/workflow-editor/categorised-node-select/categorised-node-select-impl';
import PersistClassName from '../decorators/PersistClassName.mjs';
import type {FromJSON, ToJSON} from '../decorators/to-json.mjs';
import {JsonProp, Serialisable} from '../decorators/to-json.mjs';
import {TRIGGER_REGISTRY} from '../registries/trigger-registry.mjs';
import {EMPTY_ARR, EMPTY_OBJ} from '../util.mjs';
import {formatOptionDefinitions} from '../util/registry-utils/format-option-definitions.mjs';
import {getFromRegistryOrLog} from '../util/registry-utils/get-from-registry-or-log.mjs';
import OptsListItem from './opts-list-item.mjs';
import type {TriggerDefinitionContext} from './trigger-definition-context.mjs';

type Init = Partial<Pick<WorkflowTrigger, 'trigger' | 'opts'>>;

export type WorkflowTriggerJson = Pick<WorkflowTrigger, 'opts' | 'id'>;

@PersistClassName('WorkflowTrigger')
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
export class WorkflowTrigger extends OptsListItem {

  /** @internal */
  public static fromJSON: FromJSON<WorkflowTrigger>['fromJSON'];

  public trigger: TriggerDefinitionContext<Obj<any>>;

  public constructor(init: Init = EMPTY_OBJ) {
    super(init);
    this.trigger = init.trigger ?? allTriggerSelectGroups.value[0].items[0];
    if (!this.opts) {
      this.resetOpts();
    }
  }

  /** Shortcut to {@link TriggerDefinitionContext#listen} */
  public listen(): Observable<void> {
    return this.trigger.listen(this.opts);
  }

  /** Shortcut to {@link TriggerNodeDefinition#check} */
  public check(): boolean {
    return this.trigger.def.check(this.opts);
  }

  /** Shortcut for getting the trigger ID */
  @JsonProp()
  public get id(): string {
    return this.trigger.id;
  }

  /** SHortcut for getting the trigger's option definitions */
  public get nodeOptions(): readonly NodeOption[] {
    return this.trigger?.def.options ?? EMPTY_ARR;
  }

  /** Reset options to the trigger's defaults */
  public resetOpts(): void {
    this.opts = this.trigger.def.initOptions?.() ?? {};
  }

  /** @inheritDoc */
  protected override getOptions(): NodeOption[] | undefined {
    return this.nodeOptions as NodeOption[];
  }
}

export interface WorkflowTrigger extends ToJSON<WorkflowTriggerJson> {

}
