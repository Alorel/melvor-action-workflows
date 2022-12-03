import type {VNode} from 'preact';
import HelpPageSection from './help-page-section';
import YoutubeEmbed from './youtube-embed';

export function SettingUpHelp(): VNode {
  return (
    <HelpPageSection heading={'Your first workflow'}>
      <ol>
        <li>Create a workflow made up of steps & actions</li>
        <li>Select it in the dashboard</li>
        <li>Click "Run"</li>
      </ol>
      <p>The video below shows this in action:</p>
      <YoutubeEmbed vidId={'vj2QVi57eDA'}/>
    </HelpPageSection>
  );
}

export function LoopsHelp(): VNode {
  return (
    <HelpPageSection heading={'Making a workflow loop'}>
      <p>Use the "Jump to step" action & make it go to the first step. See video below:</p>
      <YoutubeEmbed vidId={'PLCwNcGQ4po'}/>
    </HelpPageSection>
  );
}

export function OfflineHelp(): VNode {
  return (
    <HelpPageSection heading={'Does the mod work offline?'}>
      The mod doesn't work offline
    </HelpPageSection>
  );
}
