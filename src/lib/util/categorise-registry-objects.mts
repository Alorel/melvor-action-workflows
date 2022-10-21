import type {NamespaceRegistry} from 'melvor';
import type {NodeDefinition} from '../../public_api';
import type {NamespacedDefinition} from '../namespaced-definition.mjs';
import {LazyMap} from './lazy-map.mjs';

export interface CategorisedObject<T> {
  category: string;

  items: T[];
}

export default function categoriseRegistryObjects<T extends NodeDefinition, D extends NamespacedDefinition<T>>(
  registry: NamespaceRegistry<D>
): Array<CategorisedObject<D>> {
  let out: Array<CategorisedObject<D>>;

  {
    const map = new LazyMap<string, D[]>(() => []);
    for (const item of registry.registeredObjects.values()) {
      map.ensureGet(item.def.category ?? '').push(item);
    }

    out = Array(map.size);
    let i = -1;
    for (const [category, items] of map) {
      out[++i] = {category, items};
    }
  }

  out.sort(({category: a}, {category: b}) => (
    a > b
      ? 1
      : a < b
        ? -1
        : 0
  ));

  const innerSorter = ({def: {label: a}}: D, {def: {label: b}}: D): number => (
    a > b
      ? 1
      : a < b
        ? -1
        : 0
  );

  for (const {items} of out) {
    items.sort(innerSorter);
  }

  return out;
}