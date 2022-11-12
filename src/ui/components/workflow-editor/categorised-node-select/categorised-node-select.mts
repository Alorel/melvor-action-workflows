import type {NamespaceRegistry} from 'melvor';
import type {NamespacedDefinition} from '../../../../lib/namespaced-definition.mjs';
import {EMPTY_ARR} from '../../../../lib/util.mjs';
import type {CategorisedObject} from '../../../../lib/util/categorise-registry-objects.mjs';
import {errorLog} from '../../../../lib/util/log.mjs';
import type {Referenceable} from '../../../../public_api';
import {makeComponent} from '../../../common.mjs';
import ClearBtn from '../../clear-btn/clear-btn.mjs';
import tplId from './categorised-node-select.pug';

export interface CategorisedNodeSelectBtn {
  css: `btn-outline-${string}`;

  key: string;

  text: string;

  onClick(evt: Event): void;
}

interface Props<T extends NamespacedDefinition<Referenceable>> {
  buttons?: CategorisedNodeSelectBtn[];

  clearable?: boolean;

  value: T | undefined;

  values: Array<CategorisedObject<T>>;

  onChange(value?: T): void;

  registry(): NamespaceRegistry<T>;
}

export {Props as CategorisedNodeSelectProps};

type Def = NamespacedDefinition<Referenceable>;
type This<T extends Def> = ReturnType<typeof CategorisedNodeSelect<T>>;

function clear<T extends Def>(this: This<T>): void {
  if (this.clearable && this.value) {
    this.value = undefined;
    this.onChange(this.value);
  }
}

export default function CategorisedNodeSelect<T extends Def>({
  buttons = EMPTY_ARR,
  clearable = false,
  onChange,
  registry,
  value,
  values,
}: Props<T>
) {
  return makeComponent(`#${tplId}`, {
    buttons,
    clear,
    clearable,
    ClearBtn,
    get id() {
      return this.value?.id;
    },
    set id(newId: string | undefined) {
      if (newId) {
        const triggo = this.registry().getObjectByID(newId);
        if (triggo) {
          this.value = triggo;
          this.onChange(triggo);
        } else {
          errorLog(`Somehow got trigger ${newId} in <select>, but not in the registry`);
          if (this.value !== this.values[0].items[0]) {
            this.value = this.values[0].items[0];
            this.onChange();
          }
        }
      } else if (this.value !== this.values[0].items[0]) {
        this.value = this.values[0].items[0];
        this.onChange();
      }
    },
    onChange,
    registry,
    value,
    values,
  });
}
