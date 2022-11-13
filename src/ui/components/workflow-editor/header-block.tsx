import {memo} from 'preact/compat';
import {useCallback, useContext, useState} from 'preact/hooks';
import useReRender from '../../hooks/re-render';
import {mkClass} from '../../util/mk-class.mjs';
import {BorderedBlock} from '../block';
import Btn from '../btn';
import {EDITOR_CTX, EDITOR_SECTION_CLASS} from './editor-ctx.mjs';

export interface WorkflowEditorHeaderBlockProps {
  onSave(e: Event): void;
}

const WorkflowEditorHeaderBlock = memo<WorkflowEditorHeaderBlockProps>(({
  children,
  onSave,
}) => {
  const {touched, workflow} = useContext(EDITOR_CTX)!;
  const [inpTouched, setInpTouched] = useState(false);

  const reRender = useReRender();
  const onBlur = useCallback(() => {
    setInpTouched(true);
  }, []);
  const onChange = useCallback((e: Event): void => {
    workflow.name = (e.target as HTMLInputElement).value;
    reRender();
  }, [workflow]);

  return (
    <div class={mkClass('row', touched.value && 'ActionWorkflowsCore-touched')}>
      <div class={EDITOR_SECTION_CLASS}>
        <BorderedBlock kind={'agility'} size={2}>
          <div class={mkClass('row mb-3', inpTouched && 'ActionWorkflowsCore-touched')}>
            <span class={'font-size-sm pr-1 col-auto'}>{'Workflow name'}</span>
            <div class={mkClass('col-auto', !workflow.name.trim() && 'ActionWorkflowsCore-f-invalid')}>
              <input class={'form-control form-control-sm'}
                value={workflow.name}
                onBlur={onBlur}
                onInput={onChange}
                required/>
            </div>
          </div>

          <div class={'text-right'}>
            {children}
            <Btn kind={'success'} size={'sm'} onClick={onSave}>{'Save'}</Btn>
          </div>
        </BorderedBlock>
      </div>
    </div>
  );
});

export default WorkflowEditorHeaderBlock;


