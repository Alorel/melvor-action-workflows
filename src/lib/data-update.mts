import update0001 from './updates/0001-dedupe-names.mjs';
import update0002 from './updates/0002-compress-json.mjs';
import update0003 from './updates/0003-compress-ids.mjs';

/**
 * @return [number of deleted/obsolete scripts, updates array]
 */
function getUpdatesArray(): [number, DataUpdateFn[]] {
  return [
    0,
    [
      update0001,
      update0002,
      update0003,
    ],
  ];
}

export type SerialisedWorkflow = any;

export type DataUpdateFn = (workflows: SerialisedWorkflow[]) => void;

export interface RunUpdatesResult {

  /** Whether at least one update got applied or not */
  applied: boolean;

  /** The data version for this mod version */
  update: number;
}

/**
 * Run data updates when the storage format changes to avoid users having to redefine all their workflows
 * @param dataVersion The current data version
 * @param data The raw loaded data
 * @return Whether at least one update got applied or not
 */
export function runUpdates(dataVersion: number, data: any[]): RunUpdatesResult {
  const [skipped, updateFns] = getUpdatesArray();

  // The version defaults to -1 - add 1 to get array index 0
  const firstIdx = dataVersion + 1 - skipped;
  for (let i = firstIdx; i < updateFns.length; ++i) {
    updateFns[i](data);
  }

  return {
    applied: firstIdx < updateFns.length,
    update: updateFns.length - 1 + skipped,
  };
}

export function getUpdateNumber(): number {
  const [add, arr] = getUpdatesArray();

  return arr.length - 1 + add;
}
