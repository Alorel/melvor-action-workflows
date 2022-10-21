import type {Obj} from '../../../public_api';
import type {ToJsonFormatter} from '../to-json.mjs';
import {isToJSON} from '../to-json.mjs';

export function FormatDeepToJsonObject<T extends object>(
  fromFn?: (value: T[string & keyof T], key: string & keyof T) => any
): ToJsonFormatter {
  if (!fromFn) {
    return defaultFormatter;
  }

  return {
    from(raw) {
      if (!raw) {
        return {};
      }

      return Object
        .fromEntries(
          (Object.entries(raw) as Array<[string & keyof T, T[string & keyof T]]>)
            .map(([k, v]) => [k, fromFn(v, k)])
        );
    },
    to,
  };
}

function formatDeepToJsonValue(val: any): any {
  return val == null
    ? null
    : isToJSON(val)
      ? val.toJSON()
      : val instanceof NamespacedObject
        ? val.id
        : Array.isArray(val)
          ? val.map(formatDeepToJsonValue)
          : val;
}

function deepJsonReducer(acc: Obj<any>, [key, val]: [string, any]): Obj<any> {
  acc[key] = formatDeepToJsonValue(val);

  return acc;
}

function to(live: any): any {
  return live == null || typeof live !== 'object'
    ? live
    : Object.entries(live).reduce(deepJsonReducer, {});
}

const defaultFormatter: ToJsonFormatter = {
  from: v => ({...v}),
  to,
};
