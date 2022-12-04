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
import {isUndefinedOr} from './util/type-is.mjs';

type IsBase = NodeOptionBase & Obj<any>;

function isNodeOptionBase(v: any): v is IsBase {
  return isReferenceableNoNamespace(v)
    && isUndefinedOr(v.showIf, 'function')
    && isUndefinedOr(v.required, 'boolean')
    && isUndefinedOr(v.description, 'string');
}

function isNodeOption(v: any): v is NodeOption {
  return isNodeOptionBase(v)
    && new AwesomeIter(OPTION_REGISTRY.values()).consume(some(opt => opt.is(v)));
}

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

  const {check, init, listen} = v as Partial<TriggerNodeDefinition>;

  return typeof check === 'function'
    && isUndefinedOr(listen, 'function')
    && isUndefinedOr(init, 'function');
}

export function isOptionDefinition(v: any): v is OptionDefinition<unknown, NodeOptionBase> {
  return typeof v?.is === 'function'
    && 'token' in v
    && typeof v.renderEdit === 'function'
    && typeof v.renderView === 'function'
    && isUndefinedOr(v.hasLabel, 'boolean');
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
  return isReferenceableNoNamespace(v) && typeof v.namespace === 'string';
}

function isReferenceableNoNamespace(v: any): v is (Omit<Referenceable, 'namespace'> & Obj<any>) {
  return typeof v?.localID === 'string'
    && typeof v.label === 'string';
}
