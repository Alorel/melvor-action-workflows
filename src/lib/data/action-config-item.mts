import type {Obj} from '../../public_api';
import {allActions} from '../../ui/pages/new-workflow/categorised-node-select/action-select.mjs';
import AutoIncrement from '../decorators/auto-increment.mjs';
import {FormatDeepToJsonObject} from '../decorators/to-json-formatters/format-deep-to-json-object.mjs';
import type {CompressedJsonArray} from '../decorators/to-json-formatters/format-to-json-array-compressed.mjs';
import {FormatToJson} from '../decorators/to-json-formatters/format-to-json.mjs';
import type {FromJSON, ToJSON} from '../decorators/to-json.mjs';
import {JsonProp, Serialisable} from '../decorators/to-json.mjs';
import {ActionNodeDefinitionImpl} from '../registries/action-registry.mjs';
import {EMPTY_OBJ} from '../util.mjs';
import {formatOptionDefinitions} from '../util/registry-utils.mjs';

type Init = Partial<Pick<ActionConfigItem, 'action' | 'opts'>>;

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
class ActionConfigItem {

  /** @internal */
  public static fromJSON: FromJSON<ActionConfigItem>['fromJSON'];

  @JsonProp({format: FormatToJson(ActionNodeDefinitionImpl.fromJSON)})
  public action: ActionNodeDefinitionImpl<any>;

  @AutoIncrement()
  public readonly listId!: number;

  @JsonProp({format: FormatDeepToJsonObject()})
  public opts!: Obj<any>;

  public constructor({action, opts}: Init = EMPTY_OBJ) {
    this.action = action ?? allActions.value[0].items[0];
    if (opts) {
      this.opts = opts;
    } else {
      this.resetOpts();
    }
  }

  public resetOpts(): void {
    this.opts = this.action.def.initOptions?.() ?? {};
  }
}

interface ActionConfigItem extends ToJSON<CompressedJsonArray<Init>> {
}

export default ActionConfigItem;
