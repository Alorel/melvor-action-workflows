import type {FunctionComponent} from 'preact/compat';
import {memo} from 'preact/compat';
import {useCallback, useMemo} from 'preact/hooks';
import useReRender from '../../../hooks/re-render';
import type {TriggerConfigValue} from '../../trigger-config';
import TriggerConfig from '../../trigger-config';
import {useStep} from '../editor-contexts';

const NewStepHeader: FunctionComponent = memo(function NewStepHeader() {
  const reRender = useReRender();
  const step$ = useStep();

  const stepTrigger = step$.value.trigger;

  const value = useMemo((): TriggerConfigValue => ({
    opts: stepTrigger.opts,
    trigger: stepTrigger.trigger,
  }), [stepTrigger.opts, stepTrigger.trigger]);

  const onChange = useCallback((newVal: TriggerConfigValue): void => {
    const trig = step$.peek().trigger;
    trig.trigger = newVal.trigger!;
    trig.opts = newVal.opts;
    reRender();
  }, [step$]);

  return <TriggerConfig value={value} onChange={onChange}/>;
});

export default NewStepHeader;


