import type {NamespaceRegistry} from 'melvor';
import type {NamespacedDefinition} from '../../../../lib/namespaced-definition.mjs';
import type {CategorisedObject} from '../../../../lib/util/categorise-registry-objects.mjs';
import {errorLog} from '../../../../lib/util/log.mjs';
import type {Referenceable} from '../../../../public_api';
import {makeComponent} from '../../../common.mjs';
import ClearBtn from '../../../components/clear-btn/clear-btn.mjs';
import tplId from './categorised-node-select.pug';

interface Props<T extends NamespacedDefinition<Referenceable>> {
  clearable?: boolean;

  deletable?: boolean;

  value: T | undefined;

  values: Array<CategorisedObject<T>>;

  onChange(value?: T): void;

  onDelete?(): void;

  registry(): NamespaceRegistry<T>;
}

type Def = NamespacedDefinition<Referenceable>;
type This<T extends Def> = ReturnType<typeof CategorisedNodeSelect<T>>;

function onSelectChange<T extends Def>(this: This<T>, newId: string): void {
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
}

function clear<T extends Def>(this: This<T>): void {
  if (this.clearable && this.value) {
    this.value = undefined;
    this.onChange(this.value);
  }
}


export default function CategorisedNodeSelect<T extends Def>({
  clearable,
  deletable,
  onChange,
  onDelete,
  registry,
  value,
  values,
}: Props<T>
) {
  return makeComponent(`#${tplId}`, {
    clear,
    clearable: Boolean(clearable),
    ClearBtn,
    deletable: Boolean(deletable),
    onChange,
    onDelete,
    onSelectChange,
    registry,
    value,
    values,
  });
}
