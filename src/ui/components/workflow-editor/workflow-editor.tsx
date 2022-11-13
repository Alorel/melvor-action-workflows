import type {VNode} from 'preact';
import {Fragment} from 'preact';
import {memo} from 'preact/compat';
import {useCallback, useContext} from 'preact/hooks';
import type {Workflow} from '../../../lib/data/workflow.mjs';
import useReRender from '../../hooks/re-render';
import {mkClass} from '../../util/mk-class.mjs';
import Btn from '../btn';
import {EDITOR_CTX, EDITOR_SECTION_CLASS} from './editor-ctx.mjs';
import type {WorkflowEditorHeaderBlockProps} from './header-block';
import WorkflowEditorHeaderBlock from './header-block';
import NewStep from './new-step/new-step';

type Props = WorkflowEditorHeaderBlockProps;

const WorkflowEditor = memo<Props>(props => {
  const {touched, workflow} = useContext(EDITOR_CTX)!;
  const lastStepIdx = workflow.lastStepIdx;

  const [addStep, rmStep] = useStepControls(workflow);

  return (
    <Fragment>
      <WorkflowEditorHeaderBlock {...props}/>
      <div className={mkClass('row row-deck', touched.value && 'ActionWorkflowsCore-touched')}>
        {workflow.steps.map((step, idx): VNode => (
          <div class={EDITOR_SECTION_CLASS} key={step.listId}>
            <NewStep step={step}>
              {idx === lastStepIdx && <Btn kind={'success'} onClick={addStep}>Add step</Btn>}
              {idx !== 0 && <Btn kind={'danger'} data-idx={idx} onClick={rmStep}>Remove step</Btn>}
            </NewStep>
          </div>
        ))}
      </div>
    </Fragment>
  );
});

export default WorkflowEditor;

function useStepControls(workflow: Workflow): [() => void, (e: Event) => void] {
  const reRender = useReRender();
  const addStep = useCallback((): void => {
    workflow.addStep();
    reRender();
  }, [workflow, reRender]);
  const rmStep = useCallback((e: Event): void => {
    const idx = parseInt((e.target as HTMLButtonElement).dataset.idx!);
    if (!isNaN(idx)) {
      workflow.rmStep(idx);
      reRender();
    }
  }, [workflow, reRender]);

  return [addStep, rmStep];
}
