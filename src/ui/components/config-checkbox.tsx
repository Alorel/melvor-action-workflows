import {signal} from '@preact/signals';
import type {ModContext, ModStorage} from 'melvor';
import type {TypedKeys} from 'mod-util/typed-keys';
import type {FunctionComponent} from 'preact/compat';
import {memo} from 'preact/compat';
import {useCallback, useMemo} from 'preact/hooks';
import {EMPTY_ARR} from '../../lib/util.mjs';
import useRefreshingRef from '../hooks/use-refreshing-ref.mjs';

export const enum ConfigCheckboxKey {
  RM_WORKFLOW_ON_COMPLETE = 'rmWorkflowOnComplete',
}

interface Props {
  configKey: ConfigCheckboxKey;

  /** @default accountStorage */
  storage?: TypedKeys<ModContext, ModStorage>;
}

const Component: FunctionComponent<Props> = ({children, configKey, storage}) => {
  const checked$ = useMemo(() => signal(Boolean(ctx[storage!].getItem(configKey))), EMPTY_ARR);

  const storageRef = useRefreshingRef(storage!);
  const keyRef = useRefreshingRef(configKey);

  const onInput = useCallback((e: Event) => {
    const checked = (e.target as HTMLInputElement).checked;
    const store = ctx[storageRef.current!];

    if (checked) {
      store.setItem(keyRef.current!, 1);
    } else {
      store.removeItem(keyRef.current!);
    }

    checked$.value = checked;
  }, EMPTY_ARR);

  return (
    <label>
      <input type={'checkbox'}
        class={'mr-1'}
        checked={checked$.value}
        onChange={onInput}/>
      <span class={'font-weight-normal'}>{children}</span>
    </label>
  );
};
Component.defaultProps = {storage: 'accountStorage'};
if (!process.env.PRODUCTION) {
  Component.displayName = 'ConfigCheckbox';
}

export const ConfigCheckbox = memo(Component);
