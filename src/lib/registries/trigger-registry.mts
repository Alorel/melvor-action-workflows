import type {ObservableInput, Subscriber} from 'rxjs';
import type {TriggerDefinitionContext} from '../data/trigger-definition-context.mjs';
import PersistClassName from '../util/decorators/PersistClassName.mjs';

/** All possible triggers */
export const TRIGGER_REGISTRY = new NamespaceRegistry<TriggerDefinitionContext<any>>(game.registeredNamespaces);

@PersistClassName('TriggerListener')
export class TriggerListener<T extends object = {}> {
  readonly #sub: Subscriber<void>;

  public constructor(
    public readonly ctx: TriggerDefinitionContext<T>,
    public readonly data: T,
    sub: Subscriber<void>
  ) {
    this.#sub = sub;
  }

  /** Check if the trigger's condition currently passes */
  public check(): boolean {
    return this.ctx.def.check(this.data);
  }

  /** Calls the trigger's custom listening function if one is defined */
  public customListen(): ObservableInput<any> | undefined {
    return this.ctx.def.listen?.(this.data);
  }

  /** Notify the subscriber about the trigger firing */
  public notify(): void {
    this.#sub.next();
  }
}
