import type {NodeOption} from '../../public_api';
import {allActions} from '../../ui/components/workflow-editor/categorised-node-select/action-select.mjs';
import PersistClassName from '../decorators/PersistClassName.mjs';
import type {CompressedJsonArray} from '../decorators/to-json-formatters/format-to-json-array-compressed.mjs';
import {FormatToJson} from '../decorators/to-json-formatters/format-to-json.mjs';
import type {FromJSON, ToJSON} from '../decorators/to-json.mjs';
import {JsonProp, Serialisable} from '../decorators/to-json.mjs';
import {ActionNodeDefinitionImpl} from '../registries/action-registry.mjs';
import {EMPTY_OBJ} from '../util.mjs';
import {formatOptionDefinitions} from '../util/registry-utils/format-option-definitions.mjs';
import OptsListItem from './opts-list-item.mjs';

type Init = Partial<Pick<ActionConfigItem, 'action' | 'opts'>>;

@PersistClassName('ActionConfigItem')
@Serialisable<ActionConfigItem, Partial<Init> | undefined>({
  from: init => {
    if (!(init?.action instanceof ActionNodeDefinitionImpl)) {
      return;
    }

    const out = new ActionConfigItem(init);
    if (formatOptionDefinitions(init, out.action.def.options, out.opts)) {
      return out;
    }
  },
})
class ActionConfigItem extends OptsListItem {

  /** @internal */
  public static fromJSON: FromJSON<ActionConfigItem>['fromJSON'];

  @JsonProp({format: FormatToJson(ActionNodeDefinitionImpl.fromJSON)})
  public action: ActionNodeDefinitionImpl<any>;

  public constructor(init: Init = EMPTY_OBJ) {
    super(init);
    this.action = init.action ?? allActions.value[0].items[0];
    if (!this.opts) {
      this.resetOpts();
    }
  }

  public resetOpts(): void {
    this.opts = this.action.def.initOptions?.() ?? {};
  }

  /** @inheritDoc */
  protected override getOptions(): NodeOption[] | undefined {
    return this.action.def.options;
  }
}

interface ActionConfigItem extends ToJSON<CompressedJsonArray<Init>> {
}

export default ActionConfigItem;
