import type {VNode} from 'preact';
import type {HTMLAttributes} from 'preact/compat';

interface Props extends Omit<HTMLAttributes<HTMLButtonElement>, 'kind' | 'size'> {
  kind?: string;

  size?: string;
}

export default function Btn({kind, size, ...rest}: Props): VNode {
  let clazz = 'btn';
  if (kind) {
    clazz += ` btn-outline-${kind}`;
  }
  if (size) {
    clazz += ` btn-${size}`;
  }

  return <button type={'button'} className={clazz} {...rest}></button>;
}
