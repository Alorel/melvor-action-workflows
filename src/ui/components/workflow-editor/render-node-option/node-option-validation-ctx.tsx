import type {ReadonlySignal, Signal} from '@preact/signals';
import type {ComponentChildren, VNode} from 'preact';
import {createContext} from 'preact';
import {useContext} from 'preact/hooks';

export interface NodeOptionValidationCtx {
  errors: Signal<string[]>;

  invalid: ReadonlySignal<boolean>;

  touched: Signal<boolean>;
}

const CTX = createContext<NodeOptionValidationCtx>(null as any);
CTX.displayName = 'NodeOptionValidationCtx';

interface ProvideProps extends NodeOptionValidationCtx {
  children: ComponentChildren;
}

export function ProvideNodeValidationCtx({children, ...value}: ProvideProps): VNode {
  const Provider = CTX.Provider;

  return (<Provider value={value}>{children}</Provider>);
}

export function useNodeValidationCtx(): NodeOptionValidationCtx {
  return useContext(CTX);
}
