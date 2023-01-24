import {staticComponent} from '@alorel/preact-static-component';
import {useCallback} from 'preact/hooks';
import {EMPTY_ARR} from '../../../lib/util.mjs';
import {BlockDiv} from '../../components/block';
import {sidebarItems} from '../../sidebar-mgr.mjs';

export const NoDashboardsDefined = staticComponent(function NoDashboardsDefined() {
  const openWorkflowPage = useCallback((e: Event) => {
    e.preventDefault();
    sidebarItems.value.newWorkflow.click();
  }, EMPTY_ARR);

  return (
    <BlockDiv>
      <div class={'alert alert-info text-center'}>
        <span>{'You haven\'t defined any workflows! Go! '}</span>
        <a href={'#'} onClick={openWorkflowPage}>
          <span>{'Do this '}</span>
          <strong>{'now!'}</strong>
        </a>
      </div>
    </BlockDiv>
  );
});
