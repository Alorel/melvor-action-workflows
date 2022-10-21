import {get} from 'lodash-es';
import type {NamespaceRegistry} from 'melvor';
import type {NodeOption, Obj} from '../../public_api';
import {isMediaSelectNodeOption} from '../public-api-validation.mjs';
import {errorLog} from './log.mjs';

export function getFromRegistryOrLog<T>(reg: NamespaceRegistry<T>, id: string, logID: string): T | undefined {
  const out = reg.getObjectByID(id);
  if (out) {
    return out;
  }

  errorLog(`Error getting ${logID} value ${id} from registry: not registered`);
}

export function formatOptionDefinitions(
  init: Obj<any>,
  optDefinitions: NodeOption[] | undefined,
  opts: Obj<any>
): boolean {
  if (!optDefinitions?.length) {
    return true;
  }

  for (const opt of optDefinitions) {
    const optValue = opts[opt.localID];
    if (typeof optValue !== 'string' || !isMediaSelectNodeOption(opt)) {
      continue;
    }

    const reg: NamespaceRegistry<unknown> | undefined = get(game, opt.registry);
    if (!reg) {
      errorLog('Error initialising option', opt.label, 'from', init, '- registry', opt.registry, 'not found on game object');
      return false;
    }

    const resolvedValue = reg.getObjectByID(optValue);
    if (resolvedValue == null) {
      errorLog('Error initialising option', opt.label, 'from', init, '- value', optValue, 'not found in', opt.registry, 'registry');
      return false;
    }

    opts[opt.localID] = resolvedValue;
  }

  return true;
}
