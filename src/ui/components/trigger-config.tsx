import {Fragment} from 'preact';
import {memo} from 'preact/compat';
import {useCallback} from 'preact/hooks';
import type {TriggerDefinitionContext} from '../../lib/data/trigger-definition-context.mjs';
import type {Obj} from '../../public_api';
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

    const options = trigger?.def.options;

    return (
      <Fragment>
        <TriggerSelect value={trigger} onChange={onTriggerInput}/>
        {options && (
          <div className={'table-responsive'}>
            <table className={'table table-sm font-size-sm'}>
              <tbody>
                {options.map(opt => {
                  const show = opt.showIf?.(opts);

                  return show !== false && (
                    <RenderNodeOption
                      key={`${opt.id}@${triggerId}`}
                      onChange={newVal => {
                        const newOpts = {
                          ...opts,
                          [opt.id]: newVal,
                        };
                        opt.resets?.forEach(prop => {
                          delete newOpts[prop];
                        });

                        onChange({...value, opts: newOpts});
                      }}
                      option={opt}
                      otherValues={opts}
                      value={opts[opt.id]}/>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Fragment>
    );
  }
);

export default TriggerConfig;
