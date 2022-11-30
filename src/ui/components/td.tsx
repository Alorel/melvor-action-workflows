import type {FunctionComponent, HTMLAttributes} from 'preact/compat';
import {mkClass} from '../util/mk-class.mjs';

type Props = Omit<HTMLAttributes<HTMLTableCellElement>, 'className'>;

const Td: FunctionComponent<Props> = ({class: inClass, ...rest}) => (
  <td class={mkClass('pb-0 border-0 align-middle', inClass)} {...rest}/>
);
Td.displayName = 'Td';

export default Td;
