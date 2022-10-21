import {identity} from 'rxjs';
import type {ToJSON, ToJsonFormatter} from '../to-json.mjs';
import type {JsonFrom} from './format-to-json.mjs';

function to<T extends ToJSON<E>, E>(live?: T[]): E[] {
  if (!live?.length) {
    return [];
  }

  const out: E[] = [];
  for (const v of live) {
    if (v != null) {
      out.push(v.toJSON());
    }
  }

  return out;
}

const defaultFormatter: ToJsonFormatter = {
  from: identity,
  to,
};

export function FormatToJsonArray(fromFn?: JsonFrom<any, any[] | null | undefined>): ToJsonFormatter {
  return fromFn ? {from: fromFn, to} : defaultFormatter;
}
