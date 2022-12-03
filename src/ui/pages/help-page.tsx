import type {VNode} from 'preact';
import PageContainer from '../components/page-container';
import autoId from '../util/id-gen.mjs';
import {LoopsHelp, OfflineHelp, SettingUpHelp} from './help-page/help-pages';

export const HELP_PAGE_ID = autoId();

export default function HelpPage(): VNode {
  return (
    <PageContainer id={HELP_PAGE_ID}>
      <div className={'list-group'}>
        <SettingUpHelp/>
        <OfflineHelp/>
        <LoopsHelp/>
      </div>
    </PageContainer>
  );
}
