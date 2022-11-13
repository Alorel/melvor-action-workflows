import {memo} from 'preact/compat';
import {useCallback} from 'preact/hooks';
import type {TriggerDefinitionContext} from '../../../../lib/data/trigger-definition-context.mjs';
import type {WorkflowStep} from '../../../../lib/data/workflow-step.mjs';
import useReRender from '../../../hooks/re-render';
import Td from '../../td';
import {TriggerSelect} from '../categorised-node-select/categorised-node-select-impl';
import RenderNodeOption from '../render-node-option/render-node-option';

interface Props {
  step: WorkflowStep;
}

const NewStepHeader = memo<Props>(({step}) => {
  const reRender = useReRender();
  const onTriggerChange = useCallback((newTrigger: TriggerDefinitionContext<any>): void => {
    step.trigger.trigger = newTrigger;
    step.trigger.resetOpts();
    reRender();
  }, [step.trigger]);

  return (
    <table className={'table table-sm font-size-sm'}>
      <tbody>
        <tr>
          <Td class={'font-w600'}>{'Trigger'}</Td>
          <Td>
            <TriggerSelect value={step.trigger.trigger} onChange={onTriggerChange}/>
          </Td>
        </tr>

        {step.trigger.trigger.def.options?.map(opt => (
          <RenderNodeOption key={`${opt.localID}@${step.trigger.listId}`}
            onChange={value => {
              step.trigger.opts = {...step.trigger.opts, [opt.localID]: value};
              reRender();
            }}
            option={opt}
            otherValues={step.trigger.opts}
            value={step.trigger.opts[opt.localID]}/>
        ))}
      </tbody>
    </table>
  );
});

export default NewStepHeader;


