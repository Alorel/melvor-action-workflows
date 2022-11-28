import type {VNode} from 'preact';
import type {HTMLAttributes} from 'preact/compat';
import type {Ref} from 'preact/hooks';

interface Props extends Omit<HTMLAttributes<HTMLButtonElement>, 'kind' | 'size'> {
  btnRef?: Ref<HTMLButtonElement>;

  kind?: string;

  size?: string;
}

export {Props as BtnProps};

export default function Btn({btnRef, kind, size, ...rest}: Props): VNode {
  let clazz = 'btn';
  if (kind) {
    clazz += ` btn-outline-${kind}`;
  }
  if (size) {
    clazz += ` btn-${size}`;
  }

  return <button type={'button'} className={clazz} ref={btnRef} {...rest}></button>;
}
