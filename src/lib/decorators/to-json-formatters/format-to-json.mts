import {identity} from 'rxjs';
import type {ToJSON, ToJsonFormatter} from '../to-json.mjs';

export type JsonFrom<I = any, O = any> = (value: I) => O;

export function FormatToJson(fromFn?: JsonFrom): ToJsonFormatter {
  return fromFn ? {from: fromFn, to} : defaultFormatter;
}

function to<V>(live?: Partial<ToJSON<V>>): V | null {
  return live?.toJSON?.() ?? null;
}

const defaultFormatter: ToJsonFormatter = {
  from: identity,
  to,
};
