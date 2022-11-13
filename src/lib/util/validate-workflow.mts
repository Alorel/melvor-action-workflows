import type {NodeOptionBase, Obj, OptionDefinition} from '../../public_api';
import {EMPTY_ARR} from '../util.mjs';

function validateBase(
  value: any,
  {required}: NodeOptionBase
): string[] | undefined {
  if (!required) {
    return;
  }

  if (Array.isArray(value)) {
    if (!value.length) {
      return ['At least one selection required'];
    }
  } else if (value == null || (typeof value === 'string' && !value.trim())) {
    return ['Required'];
  }
}

export function validateNodeOption<Val, Interface extends NodeOptionBase>(
  value: Val | undefined,
  spec: OptionDefinition<Val, Interface>,
  option: Interface,
  allValues: Obj<any>
): string[] {
  if (option.showIf && !option.showIf(allValues)) {
    return EMPTY_ARR;
  }

  const base = validateBase(value, option);
  const custom = spec.validate?.(value, option, allValues);

  if (!custom?.length) {
    return base ?? EMPTY_ARR;
  }

  if (base) {
    base.push(...custom);
    return base;
  }

  return custom;
}
