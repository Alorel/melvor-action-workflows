import type {ToJSON, ToJsonFormatter} from '../to-json.mjs';
import {FormatToJsonArray} from './format-to-json-array.mjs';
import type {JsonFrom} from './format-to-json.mjs';

export type CompressedJsonKeys<E> = Array<string & keyof E>;
export type CompressedJsonValues<E> = Array<Array<E[string & keyof E]>>;

export type CompressedJsonArray<E> = [CompressedJsonKeys<E>, CompressedJsonValues<E>];

export function FormatToJsonArrayCompressed<J extends object, L>(from?: JsonFrom<J, L | undefined>): ToJsonFormatter {
  if (!from) {
    return baseFormatter;
  }

  return {
    from: json => instantiateCompressedToJsonArray<J>(json)?.map(from),
    to,
  };
}

export function isCompressedToJsonArray(v: any): v is CompressedJsonArray<unknown> {
  return Array.isArray(v)
    && v.length === 2 // eslint-disable-line @typescript-eslint/no-magic-numbers
    && Array.isArray(v[0])
    && Array.isArray(v[1])
    && v[0].every(vv => typeof vv === 'string');
}

function instantiateCompressedToJsonArray<T extends object>(data: CompressedJsonArray<T>): T[];
function instantiateCompressedToJsonArray<T extends object>(
  data: CompressedJsonArray<T> | null | undefined
): T[] | undefined;
function instantiateCompressedToJsonArray(data: any): object[] | undefined;
function instantiateCompressedToJsonArray<T extends object>(data?: CompressedJsonArray<T> | null): T[] | undefined {
  if (!isCompressedToJsonArray(data)) {
    return;
  }

  const out: T[] = [];
  const [keys, elements] = data;

  for (const rawElementValues of elements) {
    const element: Partial<T> = {};
    for (let i = 0; i < keys.length; ++i) {
      element[keys[i]] = rawElementValues[i];
    }

    out.push(element as T);
  }

  return out;
}
export {instantiateCompressedToJsonArray};

const baseFormatter: ToJsonFormatter = {
  from: instantiateCompressedToJsonArray,
  to,
};

const formatArray = FormatToJsonArray().to;

function to<T extends ToJSON<E>, E extends object>(val: T[] | readonly T[]): CompressedJsonArray<E> {
  const base: E[] = formatArray(val);
  if (!base.length) {
    return [[], []];
  }

  const keys = Object.keys(base[0]) as CompressedJsonKeys<E>;
  const values: CompressedJsonValues<E> = [];

  for (const obj of base) {
    const mirrored: CompressedJsonValues<E>[0] = []; // eslint-disable-line @typescript-eslint/no-magic-numbers
    for (const key of keys) {
      mirrored.push(obj[key]);
    }
    values.push(mirrored);
  }

  return [keys, values];
}

export {to as compressArray};
