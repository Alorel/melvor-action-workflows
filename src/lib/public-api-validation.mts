import {get} from 'lodash-es';
import type {
  ActionNodeDefinition,
  MediaItemNodeOption,
  NodeDefinition,
  NodeOption,
  NodeOptionBase,
  NumberNodeOption,
  Obj,
  Referenceable,
  StringNodeOption,
  TriggerNodeDefinition
} from '../public_api';

const _t = typeof 1;
type TypeOfStr = typeof _t;

type IsBase = NodeOptionBase & Obj<any>;

function isUndefinedOr(value: any, ty: TypeOfStr): boolean {
  return value === undefined || typeof value === ty;
}

function isNodeOptionBase(v: any): v is IsBase {
  if (!isReferenceableNoNamespace(v)) {
    return false;
  }

  const {required} = v;

  return required === undefined || required === true || required === false;
}

export function isMediaSelectNodeOption(v: IsBase): v is MediaItemNodeOption {
  return v.type === 'MediaItem'
    && typeof v.registry === 'string' && get(game, v.registry) instanceof NamespaceRegistry;
}

function isStringNodeOption(v: IsBase): v is StringNodeOption {
  return v.type === String
    && (v.enum === undefined || (v.enum !== null && typeof v.enum === 'object'));
}

function isNumberNodeOption(v: IsBase): v is NumberNodeOption {
  return v.type === Number
    && isUndefinedOr(v.min, 'number')
    && isUndefinedOr(v.max, 'number')
    && isUndefinedOr(v.step, 'number');
}

function isNodeOption(v: any): v is NodeOption {
  return isNodeOptionBase(v) && (
    isStringNodeOption(v)
    || isNumberNodeOption(v)
    || isMediaSelectNodeOption(v)
  );
}

export function isActionNodeDefinition<T extends object = {}>(v: any): v is ActionNodeDefinition<T> {
  if (!isNodeDefinition(v)) {
    return false;
  }

  const {execute} = v as ActionNodeDefinition<T>;

  // noinspection SuspiciousTypeOfGuard
  return typeof execute === 'function';
}

export function isTriggerNodeDefinition(v: any): v is TriggerNodeDefinition {
  if (!isNodeDefinition(v)) {
    return false;
  }

  const {enabled} = v as TriggerNodeDefinition;

  return isUndefinedOr(enabled, 'function');
}

function isNodeDefinition(v: any): v is (NodeDefinition & Obj<any>) {
  if (!isReferenceable(v)) {
    return false;
  }

  const {options} = v as NodeDefinition;

  return options === undefined || (Array.isArray(options) && options.every(isNodeOption));
}

function isReferenceable(v: any): v is (Referenceable & Obj<any>) {
  return isReferenceableNoNamespace(v) && typeof v.namespace === 'string';
}

function isReferenceableNoNamespace(v: any): v is (Omit<Referenceable, 'namespace'> & Obj<any>) {
  return typeof v?.localID === 'string'
    && typeof v.label === 'string';
}
