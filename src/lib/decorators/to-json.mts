import {identity} from 'rxjs';
import type {Obj} from '../../public_api';
import {warnLog} from '../util/log.mjs';

interface JsonPropCfg {
  format?: ToJsonFormatter;
}

type Item = [string, Required<JsonPropCfg>];

const baseFormatter: ToJsonFormatter = {from: identity, to: identity};

export interface ToJSON<T = unknown> {
  toJSON(): T;
}

export interface FromJSON<T> {
  fromJSON(data: any): T | undefined;
}

export interface ToJsonFormatter {
  from(json: any): any;

  to(live: any): any;
}

/** Mark the class as JSON-serialisable. Defined a `toJSON` instance method & `fromJSON` static one. */
export function Serialisable<T, P = Partial<T>>({from, override}: ImplToJsonCfg<T, P>): ClassDecorator {
  return target => {
    const proto: Partial<ToJSON<any>> & Obj<any> = target.prototype;

    target[FROM_JSON_FORMATTER] = from;
    if (PROPS in target) {
      if (override) {
        proto.toJSON = baseToJson;
      } else {
        const origToJSON = proto.toJSON;

        if (origToJSON) {
          proto.toJSON = function toJSON(this: any): Obj<any> {
            return doToJson(this, {...origToJSON.call(this)});
          };
        } else {
          proto.toJSON = baseToJson;
        }
      }

      (target as unknown as FromJSON<any>).fromJSON = fromJSON.bind(target);
    } else if (typeof proto.toJSON === 'function') {
      (target as unknown as FromJSON<any>).fromJSON = from;
    } else if (!process.env.PRODUCTION) {
      warnLog('No JSON props decorated on', target);
    }
  };
}

export function JsonProp({format = baseFormatter}: JsonPropCfg = {}): PropertyDecorator & MethodDecorator {
  return function ToJsonPropDecorator(target: Function, propertyKey: PropertyKey, desc?: PropertyDescriptor): void {
    getItems(target, propertyKey, desc).push([propertyKey as string, {
      format,
    }]);
  };
}

export function isToJSON(v: any): v is ToJSON {
  return typeof v?.toJSON === 'function';
}

const PROPS: unique symbol = Symbol('JSON props');
const FROM_JSON_FORMATTER: unique symbol = Symbol('fromJSON formatter');

function doToJson(ctx: any, out: Obj<any>): Obj<any> {
  for (const [localProp, {format: {to}}] of ctx[PROPS] as Item[]) {
    out[localProp] = to(ctx[localProp]);
  }

  return out;
}

function baseToJson(this: Obj<any>): Obj<any> {
  return doToJson(this, {});
}

function getItems(target: Function, key: PropertyKey, desc: PropertyDescriptor | undefined): Item[] {
  if (typeof key !== 'string') {
    throw new Error(`Can't serialise a non-string field: ${String(key)}`);
  } else if (desc && !desc.get) {
    throw new Error(`Can't decorate ${key} - not a property or getter`);
  }

  const clazz: Function = target.constructor;

  let items: Item[] | undefined = clazz[PROPS];
  if (!items) {
    items = [];
    clazz[PROPS] = target[PROPS] = items;
  }

  return items;
}

function fromJSON<T>(this: object, obj: any): any {
  if (!obj) {
    return;
  }

  const partialObj: Partial<T> = {};
  for (const [prop, {format: {from}}] of this[PROPS] as Item[]) {
    const v = from(obj[prop]);
    if (v != null) {
      partialObj[prop] = v;
    }
  }

  return (this[FROM_JSON_FORMATTER] as ImplToJsonCfg<T, Partial<T>>['from'])(partialObj);
}

interface ImplToJsonCfg<T, P> {
  override?: boolean;
  from(val: P): T | undefined,
}
