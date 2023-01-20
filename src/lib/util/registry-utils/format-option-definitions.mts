import {get} from 'lodash-es';
import type {NamespaceRegistry} from 'melvor';
import isMediaItemOption from '../../../option-types/media-item-option.mjs';
import {isTriggerRefOption} from '../../../option-types/trigger-ref/is-trigger-ref-option.mjs';
import type {MediaItemNodeOption, NodeOption, Obj, TriggerRefOption} from '../../../public_api';
import {WorkflowTrigger} from '../../data/workflow-trigger.mjs';
import {TRIGGER_REGISTRY} from '../../registries/trigger-registry.mjs';
import {DeserialisationError} from '../to-json.mjs';

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
): void {
  if (!optDefinitions?.length) {
    return;
  }

  for (const opt of optDefinitions) {
    if (isMediaItemOption(opt)) {
      formatMediaItem(opt, init, opts);
    } else if (isTriggerRefOption(opt)) {
      formatTriggerRef(opt, init, opts);
    }
  }
}

function formatTriggerRef(
  opt: TriggerRefOption,
  init: Obj<any>,
  opts: Obj<any>
): void {
  type PartialTrigger = Pick<WorkflowTrigger, 'id' | 'opts'>;
  const optValue: PartialTrigger | Array<PartialTrigger | null> | null = opts[opt.localID];

  if (Array.isArray(optValue)) {
    const mapped: Array<WorkflowTrigger | null> = Array(optValue.length);
    for (let i = 0; i < optValue.length; ++i) {
      const currOptValue = optValue[i];
      if (!currOptValue) {
        mapped[i] = null;
        continue;
      }

      const trigger = TRIGGER_REGISTRY.getObjectByID(currOptValue.id);

      if (!trigger) {
        throw new DeserialisationError(init, `No trigger with the given ID: ${currOptValue.id}`);
      }

      formatOptionDefinitions(currOptValue.opts, trigger.def.options, currOptValue.opts);

      mapped[i] = new WorkflowTrigger({opts: currOptValue.opts, trigger});
    }

    opts[opt.localID] = mapped;
  } else {
    if (!optValue) {
      return;
    }

    const trigger = TRIGGER_REGISTRY.getObjectByID(optValue.id);
    if (!trigger) {
      throw new DeserialisationError(init, `No trigger with the given ID: ${optValue.id}`);
    }

    formatOptionDefinitions(optValue.opts, trigger.def.options, optValue.opts);

    opts[opt.localID] = trigger;
  }
}

function formatMediaItem(
  opt: MediaItemNodeOption,
  init: Obj<any>,
  opts: Obj<any>
): void {
  const reg: NamespaceRegistry<unknown> | undefined = get(
    game,
    typeof opt.registry === 'function'
      ? opt.registry(opts)
      : opt.registry
  );

  if (!reg) {
    throw new DeserialisationError(init, `Registry ${opt.registry} not found`);
  }

  const optValue = opts[opt.localID];

  if (Array.isArray(optValue)) {
    if (!optValue.every(v => typeof v === 'string')) {
      return;
    }

    const mapped: any[] = Array(optValue.length);
    for (let i = 0; i < optValue.length; ++i) {
      mapped[i] = reg.getObjectByID(optValue[i]);
      if (mapped[i] == null) {
        throw new DeserialisationError(init, `Option ${optValue[i]} not found in registry ${opt.registry}`);
      }
    }

    opts[opt.localID] = mapped;
  } else if (typeof optValue === 'string') {
    const resolvedValue = reg.getObjectByID(optValue);
    if (resolvedValue == null) {
      throw new DeserialisationError(init, `Option ${optValue} not found in registry ${opt.registry}`);
    }

    opts[opt.localID] = resolvedValue;
  }
}
