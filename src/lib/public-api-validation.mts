import {AwesomeIter} from '@aloreljs/awesome-iter';
import {some} from '@aloreljs/awesome-iter/consumers';
import type {
  ActionNodeDefinition,
  NodeDefinition,
  NodeOption,
  NodeOptionBase,
  Obj,
  Referenceable,
  TriggerNodeDefinition
} from '../public_api';
import type {OptionDefinition} from './define-option.mjs';
import {OPTION_REGISTRY} from './registries/option-registry.mjs';
import {IS_LOCALLY_DEFINED} from './util/define-local.mjs';
import {errorLog} from './util/log.mjs';
import {isUndefinedOr, typeIs} from './util/type-is.mjs';

type IsBase = NodeOptionBase & Obj<any>;

export function isActionNodeDefinition<T extends object = {}>(v: any): v is ActionNodeDefinition<T> {
  if (!isNodeDefinition(v)) {
    return false;
  }

  const {execute} = v as Partial<ActionNodeDefinition<T>>;

  return typeof execute === 'function';
}

export function isTriggerNodeDefinition(v: any): v is TriggerNodeDefinition {
  if (!isNodeDefinition(v)) {
    return false;
  }

  const {canBeDefault, check, init, listen} = v as Partial<TriggerNodeDefinition>;

  return typeof check === 'function'
    && isUndefinedOr(canBeDefault, 'boolean')
    && isUndefinedOr(listen, 'function')
    && isUndefinedOr(init, 'function');
}

export function isOptionDefinition(v: any): v is OptionDefinition<unknown, NodeOptionBase> {
  if (!v || !('token' in v)) {
    return false;
  }

  const {is, renderEdit, renderView, hasLabel} = v as Partial<OptionDefinition<any, any>>;

  return typeof is === 'function'
    && typeof renderEdit === 'function'
    && typeof renderView === 'function'
    && isUndefinedOr(hasLabel, 'boolean');
}

/** Only permit the base mod to have numeric IDs */
export function checkLocallyDefinedId<T extends Referenceable>(obj: T): void {
  if (!obj[IS_LOCALLY_DEFINED] && typeof (obj.id as unknown) === 'number') {
    errorLog('Error defining object', obj);
    throw new Error(`Only the base mod may have numeric IDs; received ${obj.id}`);
  }
}

function isNodeDefinition(v: any): v is (NodeDefinition & Obj<any>) {
  if (!isReferenceable(v)) {
    return false;
  }

  const {media, options} = v as NodeDefinition;

  return typeof (media as any) === 'string'
    && (options === undefined || (Array.isArray(options) && options.every(isNodeOption)));
}

function isReferenceable(v: any): v is (Referenceable & Obj<any>) {
  if (!v) {
    return false;
  }

  const {label, id} = v as Partial<Referenceable>;

  return typeIs(label, 'string', 'function')
    && typeIs(id, 'string', 'number');
}

function isNodeOptionBase(v: any): v is IsBase {
  return isReferenceable(v)
    && isUndefinedOr(v.showIf, 'function')
    && isUndefinedOr(v.compactRender, 'function')
    && isUndefinedOr(v.required, 'boolean')
    && isUndefinedOr(v.description, 'string')
    && (Array.isArray(v.resets) || typeof v.resets === 'undefined');
}

function isNodeOption(v: any): v is NodeOption {
  return isNodeOptionBase(v)
    && new AwesomeIter(OPTION_REGISTRY.values()).consume(some(opt => opt.is(v)));
}
