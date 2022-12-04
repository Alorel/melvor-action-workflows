import {get} from 'lodash-es';
import type {NamespaceRegistry} from 'melvor';
import isMediaItemOption from '../../../option-types/media-item-option.mjs';
import {isTriggerRefOption} from '../../../option-types/trigger-ref/is-trigger-ref-option.mjs';
import type {MediaItemNodeOption, NodeOption, Obj, TriggerRefOption} from '../../../public_api';
import {WorkflowTrigger} from '../../data/workflow-trigger.mjs';
import {TRIGGER_REGISTRY} from '../../registries/trigger-registry.mjs';
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
    if (isMediaItemOption(opt)) {
      if (!formatMediaItem(opt, init, opts)) {
        return false;
      }
    } else if (isTriggerRefOption(opt)) {
      if (!formatTriggerRef(opt, init, opts)) {
        return false;
      }
    }
  }

  return true;
}

function formatTriggerRef(
  opt: TriggerRefOption,
  init: Obj<any>,
  opts: Obj<any>
): boolean {
  type PartialTrigger = Pick<WorkflowTrigger, 'id' | 'opts'>;
  const optValue: PartialTrigger | Array<PartialTrigger | null> | null = opts[opt.localID];

  if (Array.isArray(optValue)) {
    const mapped: Array<WorkflowTrigger | null> = Array(optValue.length);
    for (let i = 0; i < optValue.length; ++i) {
      if (!optValue[i]) {
        mapped[i] = null;
        continue;
      }

      const trigger = TRIGGER_REGISTRY.getObjectByID(optValue[i]!.id);

      if (!trigger) {
        errorLog('Error initialising option', opt.label, 'from', init, '- value', optValue, 'not found');
        return false;
      }

      formatOptionDefinitions(optValue[i]!.opts, trigger.def.options, optValue[i]!.opts);

      mapped[i] = new WorkflowTrigger({opts: optValue[i]!.opts, trigger});
    }

    opts[opt.localID] = mapped;
  } else {
    if (!optValue) {
      return true;
    }

    const trigger = TRIGGER_REGISTRY.getObjectByID(optValue.id);
    if (!trigger) {
      errorLog('Error initialising option', opt.label, 'from', init, '- value', optValue, 'not found');
      return false;
    }

    formatOptionDefinitions(optValue.opts, trigger.def.options, optValue.opts);

    opts[opt.localID] = trigger;
  }

  return true;
}

function formatMediaItem(
  opt: MediaItemNodeOption,
  init: Obj<any>,
  opts: Obj<any>
): boolean {
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
      return true;
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

  return true;
}
