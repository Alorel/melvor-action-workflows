import {get} from 'lodash-es';
import type {NamespaceRegistry} from 'melvor';
import isMediaItemOption from '../../../option-types/media-item-option.mjs';
import type {NodeOption, Obj} from '../../../public_api';
import {errorLog} from '../log.mjs';

/**
 * Serialisation util for formatting option definition objects
 * @param init Raw serialised data
 * @param optDefinitions All option definitions
 * @param opts Option values
 * @return Whether the data is valid or not
 */
export function formatOptionDefinitions(
  init: Obj<any>,
  optDefinitions: NodeOption[] | undefined,
  opts: Obj<any>
): boolean {
  if (!optDefinitions?.length) {
    return true;
  }

  for (const opt of optDefinitions) {
    if (!isMediaItemOption(opt)) {
      continue;
    }

    const reg: NamespaceRegistry<unknown> | undefined = get(
      game,
      typeof opt.registry === 'function'
        ? opt.registry(opts)
        : opt.registry
    );

    if (!reg) {
      errorLog('Error initialising option', opt.label, 'from', init, '- registry', opt.registry, 'not found on game object');
      return false;
    }

    const optValue = opts[opt.localID];

    if (Array.isArray(optValue)) {
      if (!optValue.every(v => typeof v === 'string')) {
        continue;
      }

      const mapped: any[] = Array(optValue.length);
      for (let i = 0; i < optValue.length; ++i) {
        mapped[i] = reg.getObjectByID(optValue[i]);
        if (mapped[i] == null) {
          errorLog('Error initialising option', opt.label, 'from', init, '- value', optValue, 'at idx', i, 'not found in', opt.registry, 'registry');
          return false;
        }
      }

      opts[opt.localID] = mapped;
    } else if (typeof optValue === 'string') {
      const resolvedValue = reg.getObjectByID(optValue);
      if (resolvedValue == null) {
        errorLog('Error initialising option', opt.label, 'from', init, '- value', optValue, 'not found in', opt.registry, 'registry');
        return false;
      }

      opts[opt.localID] = resolvedValue;
    }
  }

  return true;
}
