import type {Observable} from 'rxjs';
import type {NodeOption, Obj} from '../../public_api';
import {defaultTrigger} from '../../ui/components/workflow-editor/categorised-node-select/categorised-node-select-impl';
import {EMPTY_ARR, EMPTY_OBJ} from '../util.mjs';
import PersistClassName from '../util/decorators/PersistClassName.mjs';
import {formatOptionDefinitions} from '../util/registry-utils/format-option-definitions.mjs';
import OptsListItem from './opts-list-item.mjs';
import {TriggerDefinitionContext} from './trigger-definition-context.mjs';

type Init = Partial<Pick<WorkflowTrigger, 'trigger' | 'opts'>>;

export type WorkflowTriggerJson = ReturnType<WorkflowTrigger['toJSON']>;

@PersistClassName('WorkflowTrigger')
export class WorkflowTrigger extends OptsListItem {

  public trigger: TriggerDefinitionContext<Obj<any>>;

  public constructor(init: Init = EMPTY_OBJ) {
    super(init);
    this.trigger = init.trigger ?? defaultTrigger.value;
    if (!this.opts) {
      this.resetOpts();
    }
  }

  /** Shortcut for getting the trigger ID */
  public get id(): string {
    return this.trigger.id;
  }

  /** SHortcut for getting the trigger's option definitions */
  public get nodeOptions(): readonly NodeOption[] {
    return this.trigger?.def.options ?? EMPTY_ARR;
  }

  public static fromJSON(input: WorkflowTriggerJson): WorkflowTrigger {
    const [id, opts] = OptsListItem.parseCommonJson(input);

    const trigger = TriggerDefinitionContext.fromJSON(id);
    formatOptionDefinitions(input, trigger.def.options, opts ?? {});

    return new WorkflowTrigger({opts, trigger});
  }

  /** Shortcut to {@link TriggerNodeDefinition#check} */
  public check(): boolean {
    return this.trigger.def.check(this.opts);
  }

  /** Shortcut to {@link TriggerDefinitionContext#listen} */
  public listen(): Observable<void> {
    return this.trigger.listen(this.opts);
  }

  /** Reset options to the trigger's defaults */
  public resetOpts(): void {
    this.opts = this.trigger.def.initOptions?.() ?? {};
  }

  public toJSON() { // eslint-disable-line @typescript-eslint/explicit-module-boundary-types
    return [
      this.trigger.toJSON(),
      this.jsonifyOptions(),
    ] as const;
  }

  /** @inheritDoc */
  protected override getOptions(): NodeOption[] | undefined {
    return this.nodeOptions as NodeOption[];
  }
}

