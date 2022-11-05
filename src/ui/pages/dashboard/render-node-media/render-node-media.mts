import type {NodeDefinition} from '../../../../public_api';
import {makeComponent} from '../../../common.mjs';
import tplId from './render-node-media.pug';

export type RenderNodeMediaProps = Pick<NodeDefinition, 'label' | 'media'>;

export default function RenderNodeMedia({label, media}: RenderNodeMediaProps) {
  return makeComponent(`#${tplId}`, {label, media});
}
