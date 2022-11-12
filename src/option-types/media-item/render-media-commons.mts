import {get, stubTrue} from 'lodash-es';
import type {NamespaceRegistry as TNamespaceRegistry} from 'melvor';
import type {MediaItemNodeOption, MediaItemNodeOptionMultiConfig, MediaSelectable, Obj} from '../../public_api';

export const enum MediaItemNumbers {
  MIN_SEARCH_LENGTH = 2,
  MAX_SEARCH_RESULTS = 20,
}

export function resolveMediaItemRegistry<T extends MediaSelectable>(
  reg: MediaItemNodeOption['registry'],
  options: Obj<any>
): TNamespaceRegistry<T> | undefined {
  const key = typeof reg === 'function' ? reg(options) : reg;

  return get(game, key);
}

export interface FindItemsInit<T, V> {
  optionValues: V;

  query: string;

  source: Iterable<T>;

  filter?(item: T, optionValues: V): boolean;
}

export function *findItems<T extends MediaSelectable, V extends object>(
  {optionValues, query, source, filter = stubTrue}: FindItemsInit<T, V>
): Iterable<T> {
  let emitCounter = 0;
  for (const item of source) {
    if (!filter(item, optionValues) || !item.name.toLowerCase().includes(query)) {
      continue;
    }

    yield item;
    if (++emitCounter === MediaItemNumbers.MAX_SEARCH_RESULTS) {
      return;
    }
  }
}

export function resolveMediaMulti(option: MediaItemNodeOption['multi']): false | MediaItemNodeOptionMultiConfig {
  if (!option) {
    return false;
  }

  const defaults: MediaItemNodeOptionMultiConfig = {};

  return option === true ? defaults : Object.assign(defaults, option);
}
