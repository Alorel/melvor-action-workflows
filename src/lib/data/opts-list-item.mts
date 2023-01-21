import type {NodeOption, Obj} from '../../public_api';
import {OPTION_REGISTRY} from '../registries/option-registry.mjs';
import {EMPTY_ARR} from '../util.mjs';
import AutoIncrement from '../util/decorators/auto-increment.mjs';
import PersistClassName from '../util/decorators/PersistClassName.mjs';
import {DeserialisationError} from '../util/to-json.mjs';
import {validateNodeOption} from '../util/validate-workflow.mjs';

interface Init {
  opts?: Obj<any>;
}

type CommonJson = readonly [string, Obj<any>];

@PersistClassName('OptsListItem')
export default abstract class OptsListItem {

  /** Just a key for quick rendering inside lists */
  @AutoIncrement()
  public readonly listId!: number;

  /** Option values */
  public opts!: Obj<any>; // Gets set in extending classes' constructors

  protected constructor({opts}: Init) {
    if (opts) {
      this.opts = opts;
    }
  }

  public get isValid(): boolean {
    const opts: NodeOption[] = this.getOptions() ?? EMPTY_ARR;
    for (const opt of opts) {
      if (opt.showIf && !opt.showIf(this.opts)) {
        continue;
      }

      const value = this.opts[opt.id];
      const spec = OPTION_REGISTRY.get(opt.type)!;
      if (validateNodeOption(value, spec, opt, this.opts).length) {
        return false;
      }
    }

    return true;
  }

  protected static parseCommonJson<T extends CommonJson>(input: T): T {
    if (!Array.isArray(input)) {
      throw new DeserialisationError(input, `${this.name} input not an array`);
    }

    const opts = input[1];

    if (opts && (typeof opts !== 'object' || Array.isArray(opts))) {
      throw new DeserialisationError(input, `Malformed ${this.name} options`);
    }

    return input;
  }

  protected abstract getOptions(): NodeOption[] | undefined;

  protected jsonifyOptions(): Obj<any> {
    return Object.fromEntries(
      Object.entries(this.opts)
        .map(([k, v]) => [k, jsonifyOption(v)])
    );
  }
}

function jsonifyOption(val: any): any {
  return val == null
    ? null
    : val instanceof NamespacedObject
      ? val.id
      : Array.isArray(val)
        ? val.map(jsonifyOption)
        : val;
}

