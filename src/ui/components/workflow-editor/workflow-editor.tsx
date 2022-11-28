import type {VNode} from 'preact';
import {Fragment} from 'preact';
import {memo} from 'preact/compat';
import {useCallback, useContext} from 'preact/hooks';
import type {Workflow} from '../../../lib/data/workflow.mjs';
import {EMPTY_ARR} from '../../../lib/util.mjs';
import useReRender from '../../hooks/re-render';
import {mkClass} from '../../util/mk-class.mjs';
import Btn from '../btn';
import {EDITOR_CTX} from './editor-ctx.mjs';
import type {WorkflowEditorHeaderBlockProps} from './header-block';
import WorkflowEditorHeaderBlock from './header-block';
import NewStep from './new-step/new-step';

type Props = WorkflowEditorHeaderBlockProps;

const WorkflowEditor = memo<Props>(props => {
  const {touched, workflow} = useContext(EDITOR_CTX)!;

  const [addStep, rmStep] = useStepControls(workflow);
  const onClickAddStep = useCallback((e: Event) => {
    const idx = parseInt((e.target as HTMLButtonElement).dataset.idx!);
    if (isNaN(idx)) {
      return;
    }

    addStep(idx + 1);
  }, EMPTY_ARR);

  return (
    <Fragment>
      <WorkflowEditorHeaderBlock {...props}/>
      <div className={mkClass('row row-deck', touched.value && 'ActionWorkflowsCore-touched')}>
        {workflow.steps.map((step, idx): VNode => (
          <NewStep step={step} key={step.listId}>
            <Btn kind={'success'} data-idx={idx} onClick={onClickAddStep}>Add step</Btn>
            {workflow.canRemoveSteps && <Btn kind={'danger'} data-idx={idx} onClick={rmStep}>Remove step</Btn>}
          </NewStep>
        ))}
      </div>
    </Fragment>
  );
});

export default WorkflowEditor;

function useStepControls(workflow: Workflow): [(idx: number) => void, (e: Event) => void] {
  const reRender = useReRender();
  const addStep = useCallback((idx: number): void => {
    workflow.addStep(idx);
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
