import type {NamespaceRegistry} from 'melvor';
import {errorLog} from '../log.mjs';

/**
 * Get the given ID from the registry or log an error
 * @param reg The registry
 * @param id The item ID
 * @param logID Operation identifier for logging
 */
export function getFromRegistryOrLog<T>(reg: NamespaceRegistry<T>, id: string, logID: string): T | undefined {
  const out = reg.getObjectByID(id);
  if (out) {
    return out;
  }

  errorLog(`Error getting ${logID} value ${id} from registry: not registered`);
}

