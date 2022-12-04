import type {VNode} from 'preact';
import {memo} from 'preact/compat';
import {useCallback} from 'preact/hooks';
import type {TriggerDefinitionContext} from '../../lib/data/trigger-definition-context.mjs';
import type {Obj} from '../../public_api';
import Td from './td';
import {TriggerSelect} from './workflow-editor/categorised-node-select/categorised-node-select-impl';
import RenderNodeOption from './workflow-editor/render-node-option/render-node-option';

export interface TriggerConfigValue {

  /** The trigger's options */
  opts: Obj<any>;

  trigger?: TriggerDefinitionContext<any>;
}

interface Props {
  value: TriggerConfigValue;

  onChange(newVal: TriggerConfigValue): void;
}

const TriggerConfig = memo<Props>(
  function TriggerConfig({value, onChange}) {
    const onTriggerInput = useCallback((newTrigger: TriggerDefinitionContext<any>): void => {
      onChange({
        opts: newTrigger?.def.initOptions?.() ?? {},
        trigger: newTrigger,
      });
    }, [onChange]);

    const {opts, trigger} = value;
    const triggerId = trigger?.id;

    return (
      <div class={'table-responsive'}>
        <table class={'table table-sm font-size-sm'}>
          <tbody>
            <Trigger value={trigger} onChange={onTriggerInput}/>

            {trigger?.def.options?.map(opt => (
              <RenderNodeOption key={`${opt.localID}@${triggerId}`}
                onChange={newVal => {
                  onChange({
                    ...value,
                    opts: {
                      ...opts,
                      [opt.localID]: newVal,
                    },
                  });
                }}
                option={opt}
                otherValues={opts}
                value={opts[opt.localID]}/>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
);

export default TriggerConfig;

interface TriggerProps {
  value: TriggerConfigValue['trigger'] | undefined;

  onChange(val: TriggerConfigValue['trigger']): void;
}

const Trigger = memo<TriggerProps>(function Trigger({value, onChange}): VNode {
  return (
    <tr>
      <Td class={'font-w600'}>{'Trigger'}</Td>
      <Td>
        <TriggerSelect value={value} onChange={onChange}/>
      </Td>
    </tr>
  );
});
