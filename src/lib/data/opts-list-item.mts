import type {NodeOption, Obj} from '../../public_api';
import AutoIncrement from '../decorators/auto-increment.mjs';
import {FormatDeepToJsonObject} from '../decorators/to-json-formatters/format-deep-to-json-object.mjs';
import {JsonProp} from '../decorators/to-json.mjs';
import {OPTION_REGISTRY} from '../registries/option-registry.mjs';
import {EMPTY_ARR} from '../util.mjs';
import {validateNodeOption} from '../util/validate-workflow.mjs';

interface Init {
  opts?: Obj<any>;
}

export default abstract class OptsListItem {

  @AutoIncrement()
  public readonly listId!: number;

  @JsonProp({format: FormatDeepToJsonObject()})
  public opts!: Obj<any>;

  public constructor({opts}: Init) {
    if (opts) {
      this.opts = opts;
    }
  }

  protected abstract getOptions(): NodeOption[] | undefined;


  public get isValid(): boolean {
    const opts: NodeOption[] = this.getOptions() ?? EMPTY_ARR;
    for (const opt of opts) {
      if (opt.showIf && !opt.showIf(this.opts)) {
        continue;
      }

      const value = this.opts[opt.localID];
      const spec = OPTION_REGISTRY.get(opt.type)!;
      if (validateNodeOption(value, spec, opt, this.opts).length) {
        return false;
      }
    }

    return true;
  }
}
