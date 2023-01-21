import {get} from 'lodash-es';
import type {NamespaceRegistry} from 'melvor';
import isMediaItemOption from '../../../option-types/media-item-option.mjs';
import {isTriggerRefOption} from '../../../option-types/trigger-ref/is-trigger-ref-option.mjs';
import type {MediaItemNodeOption, NodeOption, Obj, TriggerRefOption} from '../../../public_api';
import type {WorkflowTriggerJson} from '../../data/workflow-trigger.mjs';
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
  const optValue: WorkflowTriggerJson | WorkflowTriggerJson[] | null = opts[opt.id];

  if (!optValue) {
    return;
  } else if (Array.isArray(optValue[0])) {
    const mapped: Array<WorkflowTrigger | null> = Array(optValue.length);

    for (let i = 0; i < optValue.length; ++i) {
      const [id, triggerOpts] = optValue[i] as WorkflowTriggerJson;

      const trigger = TRIGGER_REGISTRY.get(id);

      if (!trigger) {
        throw new DeserialisationError(init, `No trigger with the given ID: ${id}`);
      }

      formatOptionDefinitions(init, trigger.def.options, triggerOpts);

      mapped[i] = new WorkflowTrigger({opts: triggerOpts, trigger});
    }

    opts[opt.id] = mapped;

    return;
  }

  const [id, triggerOpts] = optValue as WorkflowTriggerJson;

  const trigger = TRIGGER_REGISTRY.get(id);
  if (!trigger) {
    throw new DeserialisationError(init, `No trigger with the given ID: ${id}`);
  }

  formatOptionDefinitions(init, trigger.def.options, triggerOpts);

  opts[opt.id] = new WorkflowTrigger({opts: triggerOpts, trigger});
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

  const optValue = opts[opt.id];

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

    opts[opt.id] = mapped;
  } else if (typeof optValue === 'string') {
    const resolvedValue = reg.getObjectByID(optValue);
    if (resolvedValue == null) {
      throw new DeserialisationError(init, `Option ${optValue} not found in registry ${opt.registry}`);
    }

    opts[opt.id] = resolvedValue;
  }
}
