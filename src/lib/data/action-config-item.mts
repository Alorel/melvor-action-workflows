import type {NodeOption} from '../../public_api';
import {defaultAction} from '../../ui/components/workflow-editor/categorised-node-select/categorised-node-select-impl';
import {ActionNodeDefinitionImpl} from '../registries/action-registry.mjs';
import {EMPTY_OBJ} from '../util.mjs';
import PersistClassName from '../util/decorators/PersistClassName.mjs';
import {formatOptionDefinitions} from '../util/registry-utils/format-option-definitions.mjs';
import OptsListItem from './opts-list-item.mjs';

type Init = Partial<Pick<ActionConfigItem, 'action' | 'opts'>>;

export type ActionsConfigItemJson = ReturnType<ActionConfigItem['toJSON']>;

@PersistClassName('ActionConfigItem')
class ActionConfigItem extends OptsListItem {

  public action: ActionNodeDefinitionImpl<any>;

  public constructor(init: Init = EMPTY_OBJ) {
    super(init);
    this.action = init.action ?? defaultAction.value;
    if (!this.opts) {
      this.resetOpts();
    }
  }

  public static fromJSON(input: ActionsConfigItemJson): ActionConfigItem {
    const [id, opts] = OptsListItem.parseCommonJson(input);

    const action = ActionNodeDefinitionImpl.fromJSON(id);
    formatOptionDefinitions(input, action.def.options, opts ?? {});

    return new ActionConfigItem({
      action,
      opts,
    });
  }

  /** Reset {@link #opts} to the action's defaults */
  public resetOpts(): void {
    this.opts = this.action.def.initOptions?.() ?? {};
  }

  public toJSON() { // eslint-disable-line @typescript-eslint/explicit-module-boundary-types
    return [
      this.action.toJSON(),
      this.jsonifyOptions(),
    ] as const;
  }

  /** @inheritDoc */
  protected override getOptions(): NodeOption[] | undefined {
    return this.action.def.options;
  }
}

export default ActionConfigItem;
