import type {VNode} from 'preact';
import type {HideableSectionProps} from '../../components/hideable-section';
import HideableSection from '../../components/hideable-section';

type Props = Omit<HideableSectionProps, 'startOpen'>;

export default function HelpPageSection({children, heading}: Props): VNode {
  return (
    <div class={'list-group-item'}>
      <HideableSection heading={heading}>{children}</HideableSection>
    </div>
  );
}
