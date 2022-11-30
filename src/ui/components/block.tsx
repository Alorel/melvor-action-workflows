import type {FunctionComponent, HTMLAttributes} from 'preact/compat';
import {mkClass} from '../util/mk-class.mjs';

export interface BlockProps extends Omit<HTMLAttributes<HTMLDivElement>, 'className'> {
  contentProps?: HTMLAttributes<HTMLDivElement>;
}

export const BlockDiv: FunctionComponent<BlockProps> = ({class: inClass, children, contentProps, ...rest}) => (
  <div class={mkClass('block block-rounded', inClass)} {...rest}>
    <div class={'block-content'} {...contentProps}>
      {children}
    </div>
  </div>
);
BlockDiv.displayName = 'Block';

export interface BorderedBlockProps extends Omit<BlockProps, 'size'> {
  kind: string;

  size?: number;
}

export const BorderedBlock: FunctionComponent<BorderedBlockProps>
  = ({class: inClass, kind, size, ...rest}) => (
    <BlockDiv class={mkClass(`border-top border-${kind}`, inClass, size && `border-${size}x`)} {...rest}/>
  );
BorderedBlock.displayName = 'BorderedBlock';
