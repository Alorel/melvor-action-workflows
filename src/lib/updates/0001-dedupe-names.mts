import type {DataUpdateFn} from '../data-update.mjs';

/** Ensure workflow names are unique */
const update0001: DataUpdateFn = rawWorkflows => {
  const occurrences: Record<string, number> = {};

  for (const wf of rawWorkflows) {
    if (wf.name in occurrences) {
      wf.name += ` (${++occurrences[wf.name]})`;
    } else {
      occurrences[wf.name] = 1;
    }
  }
};

export default update0001;
