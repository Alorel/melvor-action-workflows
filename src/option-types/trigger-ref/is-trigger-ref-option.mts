import type {NodeOptionBase, TriggerRefOption} from '../../public_api';

export function isTriggerRefOption(v: NodeOptionBase): v is TriggerRefOption {
  return v.type === 'TriggerRef';
}
