import {uniqueId} from 'lodash-es';
import {namespace} from '../../manifest.json';

export default function AutoId(prefix = `${namespace}:Core:el:`) {
  return {generatedId: uniqueId(prefix)} as const;
}
