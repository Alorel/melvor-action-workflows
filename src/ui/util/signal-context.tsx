import type {ReadonlySignal, Signal} from '@preact/signals';
import {signal} from '@preact/signals';
import type {ComponentType, Context, VNode} from 'preact';
import {createContext} from 'preact';
import {useMemo} from 'preact/compat';
import {useCallback, useContext} from 'preact/hooks';
import {EMPTY_ARR} from '../../lib/util.mjs';
import type {Children} from './children';

type SignalProvider = ComponentType<Required<Children>>;

type AnySignal<T> = Signal<T> | ReadonlySignal<T>;
type Initial<T> = T | (() => T);
type HostSignalFactory<T> = (initialValue?: Initial<T>) => [SignalProvider, Signal<T>];

function useFactory<T>(
  ctx: Context<Signal<T>> | Context<ReadonlySignal<T>>,
  providedSignal: AnySignal<T>
): SignalProvider {
  return useCallback(({children}: Required<Children>): VNode => (
    <ctx.Provider value={providedSignal}>{children}</ctx.Provider>
  ), EMPTY_ARR);
}

export function signalContext<T>(
  name: string,
  defaultCtxValue?: T
): [() => Signal<T>, HostSignalFactory<T>, Context<Signal<T>>] {
  const ctx = createContext<Signal<T>>(defaultCtxValue === undefined ? undefined as any : signal<T>(defaultCtxValue));
  ctx.displayName = name;

  return [
    () => useContext(ctx),
    initialValue => {
      const sig = useMemo(() => (
        signal<T>(
          typeof initialValue === 'function'
            ? (initialValue as () => T)()!
            : initialValue!
        )
      ), EMPTY_ARR);

      return [useFactory(ctx, sig), sig];
    },
    ctx,
  ];
}

