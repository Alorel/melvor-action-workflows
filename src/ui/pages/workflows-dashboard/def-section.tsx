import type {VNode} from 'preact';
import {Fragment} from 'preact';
import {memo} from 'preact/compat';
import type {NodeDefinition, Obj} from '../../../public_api';
import {mkClass} from '../../util/mk-class.mjs';
import {RenderNodeMedia} from './render-node-media';
import RenderNodeOptionValue from './render-node-option-value';

interface SectionProps {
  config: Obj<any>;

  node: NodeDefinition;

  type: 'action' | 'trigger';
}

export const DefSection = memo<SectionProps>(function DefSection({config, node, type}) {
  const hasOpts = Boolean(node.options?.length);
  const compact = hasOpts && node.compactRender?.(config);

  return (
    <Fragment>
      <div
        class={mkClass('text-center font-size-sm font-w600', !compact && type === 'action' && 'ActionWorkflowsCore-underdot')}>
        <RenderNodeMedia label={compact || node.label} media={node.media}/>
      </div>
      {hasOpts && !compact && <DefSectionOptions opts={node.options!} config={config}/>}
    </Fragment>
  );
});

interface DefProps extends Pick<SectionProps, 'config'> {
  opts: Required<NodeDefinition>['options'];
}

function DefSectionOptions({opts, config}: DefProps): VNode {
  return (
    <table class={'font-size-sm w-100'}>
      <tbody>
        {opts.map(opt => (<RenderNodeOptionValue key={opt.id}
          value={config[opt.id]}
          option={opt}
          otherValues={config}/>))}
      </tbody>
    </table>
  );
}
