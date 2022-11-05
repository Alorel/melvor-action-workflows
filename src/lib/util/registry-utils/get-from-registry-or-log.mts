import type {NamespaceRegistry} from 'melvor';
import {errorLog} from '../log.mjs';

export function getFromRegistryOrLog<T>(reg: NamespaceRegistry<T>, id: string, logID: string): T | undefined {
  const out = reg.getObjectByID(id);
  if (out) {
    return out;
  }

  errorLog(`Error getting ${logID} value ${id} from registry: not registered`);
}

