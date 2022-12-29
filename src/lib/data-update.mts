import type {Workflow} from './data/workflow.mjs';
import update0001 from './updates/update-0001.mjs';

export interface SerialisedWorkflow extends Pick<Workflow, 'name' | 'rm'> {
  steps: [string[], any[][]];
}

export type DataUpdateFn = (workflows: SerialisedWorkflow[]) => void;

export interface RunUpdatesResult {

  /** Whether at least one update got applied or not */
  applied: boolean;

  /** The data version for this mod version */
  update: number;
}

function getUpdatesArray(): DataUpdateFn[] {
  return [
    update0001,
  ];
}

/**
 * Run data updates when the storage format changes to avoid users having to redefine all their workflows
 * @param dataVersion The current data version
 * @param data The raw loaded data
 * @return Whether at least one update got applied or not
 */
export function runUpdates(dataVersion: number, data: SerialisedWorkflow[]): RunUpdatesResult {
  const updateFns = getUpdatesArray();

  // The version defaults to -1 - add 1 to get array index 0
  const firstIdx = dataVersion + 1;
  for (let i = firstIdx; i < updateFns.length; ++i) {
    updateFns[i](data);
  }

  return {
    applied: firstIdx < updateFns.length,
    update: updateFns.length - 1,
  };
}

export function getUpdateNumber(): number {
  return getUpdatesArray().length - 1;
}
